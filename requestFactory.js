const axios = require("axios").default;

// Generating api requests
class requestFactory {
    baseUrl = 'https://api.torikushi.xyz'
    
    async character(c) {
        let res = await axios.get(`${this.baseUrl}/character/${c}`);
        console.log(`Fetched ${res.data.data.character.name}`);
        return res.data.data;
    }

    async characterByType(t) {
        return axios.get(`${this.baseUrl}/character/query?type=${t}`);
    }

    async characterList() {
        //Have to concat by type because there's no endpoint to get the list of all characters
        let strikers = this.characterByType("striker");
        let specials = this.characterByType("special");
        
        let res = await Promise.all([strikers, specials]);
        return [...res[0].data.data, ...res[1].data.data];
    }
}

module.exports = requestFactory
