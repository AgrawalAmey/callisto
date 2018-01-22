const crypto = require('crypto');

function Cipher() {
    getCipher = () => {
        var config = require('../config');

        var algorithm = 'aes256';
        var key = config.encryptionKey;

        var cipher = crypto.createCipher(algorithm, key);
        var decipher = crypto.createDecipher(algorithm, key);

        return { "cipher": cipher, "decipher": decipher }
    }

    this.encrypt = (text) => {
        var cipher = getCipher().cipher
        return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    },

    this.decrypt = (encrypted_text) => {
        var decipher = getCipher().decipher
        return decipher.update(encrypted_text, 'hex', 'utf8') + decipher.final('utf8');
    }
}



module.exports = new Cipher()