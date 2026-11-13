/**
 * @class
 * @category Services
 */
class Crypto {

    /**
     * Encrypt a base64 string]
     * @public
     * @static
     * @param {string} str String to be encrypted
     * @returns {string}
     */
    public static encryptKey(str: string): string {
        return btoa(str)
    }

    /**
     * Encrypts a string using the Crypto.AES algorithm
     * @public
     * @static
     * @param {string} str String to be encrypted
     * @returns {string}
     */
    public static encryptItem(str: string): string {
        return btoa(str)
    }

    /**
     * Decrypts a string using the Crypto.AES algorithm
     * @public
     * @static
     * @param encrypted, String to be decrypted
     * @returns {string}
     */
    public static decryptItem(encrypted: string): string {
        return atob(encrypted)
    }
}

export default Crypto
