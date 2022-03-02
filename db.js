const sqlite3 = require('better-sqlite3');

function getAll(db, column, table) {
    let res =  db.prepare(`SELECT ${column.join(', ')} FROM ${table}`).all();

    // Map id with value as key.   
    if (column.length === 2) {
        let result = {}
        res.forEach(e => { 
            let key = e[column[1]];
            let value = e[column[0]];
            result[key] = value;
        });
        return result;
    }
    else { // Handle armor/damage color differently
        let result = { damage: {}, armor: {} };
        res.forEach(e => { 
            let key1 = e[column[1]];
            let key2 = e[column[2]];
            let value = e[column[0]];
            result.damage[key1] =  value,
            result.armor[key2] = value 
        });
        return result;
    }
}

class DbWrapper {
    _db = null;
    _academy = [];
    _combatClass = [];
    _damageArmorColor = [];
    _equipmentType = [];
    _firearm = [];
    _mood = [];
    _position = [];
    _role = [];
    
    _insertQueue = [];

    constructor(dbPath) {
        // Initialize db
        this._db = sqlite3(dbPath, null);

        // Populate maps
        this._academy = getAll(this._db, ["id","name_short"], "academy");
        this._combatClass = getAll(this._db, ["id", "name"], "combat_class");
        this._damageArmorColor= getAll(this._db, ["id", "damage_name", "armor_name"], "damage_armor_color");
        this._equipmentType = getAll(this._db, ["id", "name"], "equipment_type");
        this._firearm = getAll(this._db, ["id", "name_short"], "firearm");
        this._mood = getAll(this._db, ["id", "block_rate"], "mood");
        this._position = getAll(this._db, ["id", "name"], "position");
        this._role = getAll(this._db, ["id", "name"], "role");
    }       


    insertEnqueue(stu) {
        this._insertQueue.push({
            firstName: stu.character.name,
            star: stu.character.baseStar,
            role: this._role[stu.character.role],
            academy: this._academy[stu.info.school],
            combatClass: this._combatClass[stu.character.squadType],
            position: this._position[stu.character.position],
            damageType: this._damageArmorColor.damage[stu.character.bulletType],
            armorType: this._damageArmorColor.armor[stu.character.armorType],
            affinityUrban: this._mood[(parseFloat(stu.terrain.Urban.ShieldBlockRate) / 100)],
            affinityOutdoors: this._mood[parseFloat(stu.terrain.Desert.ShieldBlockRate) / 100],
            affinityIndoors: this._mood[parseFloat(stu.terrain.Indoor.ShieldBlockRate) / 100],
            equipment1: this._equipmentType[stu.equipmentType[0]],
            equipment2: this._equipmentType[stu.equipmentType[1]],
            equipment3: this._equipmentType[stu.equipmentType[2]],
            firearm: this._firearm[stu.character.weaponType],
            bio: stu.character.profile,
            age: parseInt(stu.info.age.split(" ", 2)),
            birthday: stu.info.birthDate,
            illustrator: stu.info.artist,
            voice: stu.info.voiceActor,
            height: stu.other.CharHeight.JP,
            hobbies: stu.other.Hobby.EN
        });
    }

    performBulkInsert() {
        let insert = this._db.prepare(`INSERT OR IGNORE INTO character 
            (firstName, star, role, academy, combat_class, position, damage_type, armor_type, affinity_urban, affinity_outdoors,
            affinity_indoors, equipment_1, equipment_2, equipment_3, firearm, bio, age, birthday, height, hobbies, illustrator, voice)
            VALUES 
            (@firstName, @star, @role, @academy, @combatClass, @position, @damageType, @armorType, @affinityUrban, @affinityOutdoors,
            @affinityIndoors, @equipment1, @equipment2, @equipment3, @firearm, @bio, @age, @birthday, @height, @hobbies, @illustrator, @voice)
        `);

        const insertQueuedStudents = this._db.transaction((students) => {
            for (const stu of students) {
                insert.run(stu);
            }
        })

        insertQueuedStudents(this._insertQueue);
    }
}

module.exports = DbWrapper
