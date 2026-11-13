/**
 * JWT Service
 */
export class JWTService {
    /**
     * Function to perform JWT signature verification.
     * @param {string} token Access token JWT
     * @returns 
     */
    public async verifySignature(token: string): Promise<boolean> {
        const parts = token.split('.')

        if (parts.length !== 3) {
            throw new Error('Malformed JWT!')
        }

        const [encodedHeader, encodedPayload, encodedSignature] = parts

        const issuer = import.meta.env.VITE_ISSUER
        const jwtPublicKey = import.meta.env.VITE_JWT_PUBLIC_KEY || ''

        const publicKey: CryptoKey = await this.importPublicKey(jwtPublicKey)

        const signature: Uint8Array<ArrayBuffer> = this.base64UrlToBytes(encodedSignature)

        const data: Uint8Array<ArrayBuffer> = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)

        const isValid: boolean = await crypto.subtle.verify(
            'RSASSA-PKCS1-v1_5',
            publicKey,
            signature,
            data
        )

        if (!isValid) {
            throw new Error('Invalid JWT signature!')
        }

        const payload: any = this.decodeBase64UrlJson(encodedPayload)

        if (issuer !== `${payload?.iss || ''}`) {
            throw new Error('JWT issuer mismatch!')
        }

        return Promise.resolve(isValid)

    }

    /**
     * Function to decode JWT.
     * @param token Access token.
     * @returns 
     */
    public decode(token: string): any {
        const parts: string[] = token.split('.') || []
        if (parts.length !== 3) {
            throw new Error('Malformed JWT!')
        }
        const headerStr: string = atob(parts[0])
        const header: any = JSON.parse(headerStr)
        const payloadStr: string = atob(parts[1])
        const payload: any = JSON.parse(payloadStr)
        return { header, payload }
    }

    /**
     * Function to convert a Base64-encoded string into bytes.
     * @param {string} base64Url String to be converted.
     * @returns 
     */
    private base64UrlToBytes(base64Url: string): Uint8Array<ArrayBuffer> {
        const base64 = base64Url
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const padded = base64.padEnd(
            base64.length + (4 - base64.length % 4) % 4,
            '='
        )

        const binary = atob(padded)

        return Uint8Array.from(
            binary,
            char => char.charCodeAt(0)
        )
    }

    /**
     * Function to convert a Base64-encoded string into bytes.
     * @param {string} base64 String to be converted.
     * @returns 
     */
    private base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
        const binary = atob(base64)

        return Uint8Array.from(
            binary,
            char => char.charCodeAt(0)
        )
    }

    /**
     * Function used to perform the concatenation of byte arrays.
     * @param {any[]} arrays Array of bytes to be concatenated
     * @returns 
     */
    private concatBytes(...arrays): Uint8Array<ArrayBuffer> {
        const totalLength = arrays.reduce(
            (sum, arr) => sum + arr.length,
            0
        )

        const result = new Uint8Array(totalLength)

        let offset = 0

        for (const arr of arrays) {
            result.set(arr, offset)
            offset += arr.length
        }

        return result
    }

    /**
     * Function to encode an array buffer according to its length.
     * @param {number} length Length of array buffer.
     * @returns 
     */
    private encodeDERLength(length: number): Uint8Array<ArrayBuffer> {
        if (length < 128) {
            return new Uint8Array([length])
        }

        const bytes: number[] = []

        while (length > 0) {
            bytes.unshift(length & 0xff)
            length = Math.floor(length / 256)
        }

        return new Uint8Array([
            0x80 | bytes.length,
            ...bytes
        ])
    }

    /**
     * Function to convert a PKCS1 key to SPKI format.
     * @param { Uint8Array<ArrayBuffer>} pkcs1Bytes Public key in PKCS1 format
     * @returns 
     */
    private convertPKCS1ToSPKI(pkcs1Bytes: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {

        const algorithmIdentifier = new Uint8Array([
            0x30, 0x0d,
            0x06, 0x09,
            0x2a, 0x86, 0x48, 0x86,
            0xf7, 0x0d, 0x01, 0x01, 0x01,
            0x05, 0x00
        ])


        const bitStringContent = this.concatBytes(
            new Uint8Array([0x00]),
            pkcs1Bytes
        )

        const bitString = this.concatBytes(
            new Uint8Array([0x03]),
            this.encodeDERLength(bitStringContent.length),
            bitStringContent
        )


        const spkiContent = this.concatBytes(
            algorithmIdentifier,
            bitString
        )


        return this.concatBytes(
            new Uint8Array([0x30]),
            this.encodeDERLength(spkiContent.length),
            spkiContent
        )
    }

    /**
     * Function to decode a base64-encoded string into JSON
     * @param {string} base64Url String to be converted.
     * @returns 
     */
    private decodeBase64UrlJson(base64Url: string): any {
        const bytes = this.base64UrlToBytes(base64Url)
        const text = new TextDecoder().decode(bytes)
        return JSON.parse(text)
    }

    /**
     * Function to read a public key in PKCS1 format.
     * @param {string} publicKeyPem Public key.
     * @returns 
     */
    private async importPublicKey(publicKeyPem: string): Promise<CryptoKey> {
        if (!publicKeyPem?.length) {
            throw new Error('Public key missing!')
        }

        const pemContents: string = publicKeyPem
            .replace(/-----BEGIN RSA PUBLIC KEY-----/g, '')
            .replace(/-----END RSA PUBLIC KEY-----/g, '')
            .replace(/\s+/g, '')

        const pkcs1Bytes: Uint8Array<ArrayBuffer> = this.base64ToBytes(pemContents)

        const spkiBytes: Uint8Array<ArrayBuffer> = this.convertPKCS1ToSPKI(pkcs1Bytes)

        const result: CryptoKey = await crypto.subtle.importKey(
            'spki',
            spkiBytes,
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: 'SHA-256',
            },
            false,
            ['verify']
        )

        return Promise.resolve(result)
    }
}

const jwtService: JWTService = new JWTService()

export default jwtService
