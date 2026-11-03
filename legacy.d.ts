// Read-only functions for data written by old versions: read, then re-encrypt or re-sign with the main API.
// Lenient on purpose, no guarantees: hex strings or any bytes in, a hex key gives hex results. Removed once all deprecated data is converted.

export declare function symmetricDecryptV0_2_0(gibbrish: any, key: any): Promise<string>
export declare function symmetricDecryptV0_3_1(gibbrish: any, key: any): Promise<string>
export declare function asymmetricDecryptV0_0_7(secrets: any, secretKey: any): Promise<string>
export declare function asymmetricDecryptV0_2_0(secrets: any, secretKey: any): Promise<string>
export declare function asymmetricDecryptV0_3_1(secrets: any, secretKey: any): Promise<string>
/** Resolves undefined when valid, else an error string. Never rejects. */
export declare function verifySignatureV0_2_0(sig: any, publicKey: any, content: any): Promise<string | undefined>
export declare function diffieHellmanSecretHashV0_2_0(secretKey: any, publicKey: any, contextString?: any): Promise<any>
export declare function diffieHellmanSecretRawV0_3_1(secretKey: any, publicKey: any): Promise<any>
export declare function diffieHellmanSecretHashV0_3_1(secretKey: any, publicKey: any, contextString?: any): Promise<any>
