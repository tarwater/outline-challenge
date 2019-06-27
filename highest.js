/*
Sample call:
node highest.js data.txt 5
 */

const fs = require('fs');
const readline = require('readline');

const args = process.argv.slice(2);
// process.on("exit", code => console.log(`Exiting with code ${code}`));

const throwInputError = () => {
    process.exit(2);
};

const throwFileNotFoundError = () => {
    process.exit(1);
};

// begin input validation
if (args.length !== 2) { // precisely two arguments required
    throwInputError();
}

const displayLength = parseInt(args[1]); // number of records to output

if (isNaN(displayLength) || displayLength < 1) {
    throwInputError();
}

const path = args[0];

fs.access(path, fs.F_OK, (err) => { // check for existence of data file
    if (err) { // file not found
        throwFileNotFoundError();
    }
});

// end input validation

const scores = [];
const scoreSet = new Set();

const rl = readline.createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity
});

rl.on('line', (line) => { // read file line by line
    const semicolonIndex = line.indexOf(':');
    const isBlankLine = line.trim().length === 0;

    if (semicolonIndex === -1 && !isBlankLine) { // malformed input line
        throwInputError();
    } else if (isBlankLine) { // continue on if line is blank
        return;
    }

    let score = line.slice(0, semicolonIndex);
    score = parseInt(score);
    if (isNaN(score) || score < 0) throwInputError(); // check that score is numeric and non-negative

    try {
        const json = JSON.parse(line.slice(semicolonIndex + 1));
        const ID = json.id;
        if (!ID) throwInputError();
        const obj = {
            "score": score,
            "id": ID
        };

        scores.push(obj);
        scoreSet.add(score);

        if(scores.length !== scoreSet.size) throwInputError(); // scores must be unique

    } catch (e) {
        throwInputError(); // malformed json
    }
});

rl.on('close', () => { // file is done reading
    scores.sort((a, b) => b.score - a.score); // sort results by score

    let json = JSON.stringify(scores.slice(0, displayLength));
    console.log(json);
});
