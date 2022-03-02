const requestFactory = require("./requestFactory");
const DbWrapper = require("./db")

async function run() {
    const help = "ba-fetch.js <database path>";
    if (!process.argv[2]) {
        console.log(help);
        return;
    }

    let db = new DbWrapper(process.argv[2]); 
    let factory = new requestFactory();

    // Get character list
    console.log("Getting list of characters...");
    let characterList = await factory.characterList()
    console.log(`Retrieved a total of ${characterList.length} characters...`);
    console.log(`Fecthing individual characters...`);

    // Get individual character details
    let characterPromises = [];
    for (let i = 0; i < characterList.length; i++) {
        characterPromises.push(factory.character(characterList[i]));
    }

    let res = await Promise.all(characterPromises);
    console.log("Character fetch finished.");

    //Insert into database
    for (cp of res) {
        if (cp.character.name === "Kirino")
            continue;
        if (cp.info.school = "RedWinter")
            cp.info.school = "Red Winter"
        db.insertEnqueue(cp);
    }
    console.log("Inserting...");
    db.performBulkInsert();
    console.log("Done!");
}

run()

