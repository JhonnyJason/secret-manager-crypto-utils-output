// Generated by CoffeeScript 2.6.1
//###########################################################
var ORDER, algorithm, hashToScalar, mod;

import * as noble from "@noble/ed25519";

import * as tbut from "thingy-byte-utils";

import crypto from "crypto";

//###########################################################
algorithm = 'aes-256-cbc';

ORDER = BigInt(2) ** BigInt(252) + BigInt('27742317777372353535851937790883648493');

//###########################################################
hashToScalar = function(hash) {
  var bigInt, relevant;
  relevant = hash.slice(0, 32);
  relevant[0] &= 248;
  relevant[31] &= 127;
  relevant[31] |= 64;
  bigInt = tbut.bytesToBigInt(relevant);
  return mod(bigInt);
};

mod = function(a, b = ORDER) {
  var result;
  result = a % b;
  if (result >= 0n) {
    return result;
  } else {
    return result + b;
  }
};

//###########################################################
//region exposedStuff

//###########################################################
//region shas

//###########################################################
// Hex Version
export var sha256 = function(content) {
  return tbut.bytesToHex(sha256Bytes(content));
};

export var sha512 = function(content) {
  return tbut.bytesToHex(sha512Bytes(content));
};

export var sha256Hex = sha256;

export var sha512Hex = sha512;

//###########################################################
// Bytes Version
export var sha256Bytes = function(content) {
  var hasher;
  hasher = crypto.createHash("sha256");
  hasher.update(content);
  return hasher.digest();
};

export var sha512Bytes = function(content) {
  var hasher;
  hasher = crypto.createHash("sha512");
  hasher.update(content);
  return hasher.digest();
};

//endregion

//###########################################################
//region keys

//###########################################################
// Hex Version
export var createKeyPair = async function() {
  var publicKeyBytes, publicKeyHex, secretKeyBytes, secretKeyHex;
  secretKeyBytes = noble.utils.randomPrivateKey();
  publicKeyBytes = (await noble.getPublicKey(secretKeyBytes));
  secretKeyHex = tbut.bytesToHex(secretKeyBytes);
  publicKeyHex = tbut.bytesToHex(publicKeyBytes);
  return {secretKeyHex, publicKeyHex};
};

export var createSymKey = function() {
  var keyAndIV;
  keyAndIV = crypto.randomBytes(48);
  return tbut.bytesToHex(keyAndIV);
};

export var createPublicKey = async function(secretKeyHex) {
  var publicKeyBytes;
  publicKeyBytes = (await noble.getPublicKey(secretKeyHex));
  return tbut.bytesToHex(publicKeyBytes);
};

export var createKeyPairHex = createKeyPair;

export var createSymKeyHex = createSymKey;

export var createPublicKeyHex = createPublicKey;

//###########################################################
// Byte Version
export var createKeyPairBytes = async function() {
  var publicKeyBytes, secretKeyBytes;
  secretKeyBytes = noble.utils.randomPrivateKey();
  publicKeyBytes = (await noble.getPublicKey(secretKeyBytes));
  return {secretKeyBytes, publicKeyBytes};
};

export var createSymKeyBytes = function() {
  return new Uint8Array((crypto.randomBytes(48)).buffer);
};

export var createPublicKeyBytes = async function(secretKeyBytes) {
  return (await noble.getPublicKey(secretKeyBytes));
};

//endregion

//###########################################################
//region signatures

//###########################################################
// Hex Version
export var createSignature = async function(content, signingKeyHex) {
  var hashHex, signature;
  hashHex = sha256Hex(content);
  signature = (await noble.sign(hashHex, signingKeyHex));
  return tbut.bytesToHex(signature);
};

export var verify = async function(sigHex, keyHex, content) {
  var hashHex;
  hashHex = sha256Hex(content);
  return (await noble.verify(sigHex, hashHex, keyHex));
};

export var createSignatureHex = createSignature;

export var verifyHex = verify;


//###########################################################
// Byte Version
export var createSignatureBytes = async function(content, signingKeyBytes) {
  var hashBytes;
  hashBytes = sha256Bytes(content);
  return (await noble.sign(hashBytes, signingKeyBytes));
};

export var verifyBytes = async function(sigBytes, keyBytes, content) {
  var hashBytes;
  hashBytes = sha256Bytes(content);
  return (await noble.verify(sigBytes, hashBytes, keyBytes));
};

//endregion

//###########################################################
//region symmetric encryption

//###########################################################
// Hex Version
export var symmetricEncrypt = function(content, keyHex) {
  var aesKeyBuffer, aesKeyHex, cipher, gibbrish, ivBuffer, ivHex;
  ivHex = keyHex.substring(0, 32);
  ivBuffer = Buffer.from(ivHex, "hex");
  aesKeyHex = keyHex.substring(32, 96);
  aesKeyBuffer = Buffer.from(aesKeyHex, "hex");
  // log "- - ivHex: "
  // log ivHex
  // log ivHex.length
  // log "- - aesKeyHex: "
  // log aesKeyHex
  // log aesKeyHex.length
  cipher = crypto.createCipheriv(algorithm, aesKeyBuffer, ivBuffer);
  gibbrish = cipher.update(content, 'utf8', 'hex');
  gibbrish += cipher.final('hex');
  return gibbrish;
};

export var symmetricDecrypt = function(gibbrishHex, keyHex) {
  var aesKeyBuffer, aesKeyHex, content, decipher, ivBuffer, ivHex;
  ivHex = keyHex.substring(0, 32);
  ivBuffer = Buffer.from(ivHex, "hex");
  aesKeyHex = keyHex.substring(32, 96);
  aesKeyBuffer = Buffer.from(aesKeyHex, "hex");
  // log "- - ivHex: "
  // log ivHex
  // log ivHex.length
  // log "- - aesKeyHex: "
  // log aesKeyHex
  // log aesKeyHex.length
  decipher = crypto.createDecipheriv(algorithm, aesKeyBuffer, ivBuffer);
  content = decipher.update(gibbrishHex, 'hex', 'utf8');
  content += decipher.final('utf8');
  return content;
};

export var symmetricEncryptHex = symmetricEncrypt;

export var symmetricDecryptHex = symmetricDecrypt;

//###########################################################
// Byte Version
export var symmetricEncryptBytes = function(content, keyBytes) {
  var aesKeyBuffer, allGibbrish, cipher, gibbrish, gibbrishFinal, ivBuffer;
  ivBuffer = Buffer.from(keyBytes.buffer, 0, 16);
  aesKeyBuffer = Buffer.from(keyBytes.buffer, 16, 32);
  cipher = crypto.createCipheriv(algorithm, aesKeyBuffer, ivBuffer);
  gibbrish = cipher.update(content, 'utf8');
  gibbrishFinal = cipher.final();
  allGibbrish = Buffer.concat([gibbrish, gibbrishFinal]);
  return new Uint8Array(allGibbrish);
};

export var symmetricDecryptBytes = function(gibbrishBytes, keyBytes) {
  var aesKeyBuffer, content, decipher, ivBuffer;
  ivBuffer = Buffer.from(keyBytes.buffer, 0, 16);
  aesKeyBuffer = Buffer.from(keyBytes.buffer, 16, 32);
  // gibbrishBuffer = Buffer.from(gibbrishBytes)
  decipher = crypto.createDecipheriv(algorithm, aesKeyBuffer, ivBuffer);
  content = decipher.update(gibbrishBytes, null, 'utf8');
  // content = decipher.update(gibbrishBuffer, null, 'utf8')
  content += decipher.final('utf8');
  return content;
};

//endregion

//###########################################################
//region asymmetric encryption

//###########################################################
// Hex Version
export var asymmetricEncryptOld = async function(content, publicKeyHex) {
  var ABytes, B, BHex, encryptedContentHex, gibbrish, lB, lBigInt, nBytes, nHex, referencePointHex, symkey;
  // a = Secret Key
  // k = sha512(a) -> hashToScalar
  // G = basePoint
  // B = kG = Public Key
  B = noble.Point.fromHex(publicKeyHex);
  BHex = publicKeyHex;
  // log "BHex: " + BHex

  // n = new one-time secret (generated on sever and forgotten about)
  // l = sha512(n) -> hashToScalar
  // lB = lkG = shared secret
  // key = sha512(lBHex)
  // X = symmetricEncrypt(content, key)
  // A = lG = one time public reference point
  // {A,X} = data to be stored for B

  // n = one-time secret
  nBytes = noble.utils.randomPrivateKey();
  nHex = tbut.bytesToHex(nBytes);
  lBigInt = hashToScalar(sha512Bytes(nBytes));
  
  //A one time public key = reference Point
  ABytes = (await noble.getPublicKey(nHex));
  lB = (await B.multiply(lBigInt));
  symkey = sha512Hex(lB.toHex());
  gibbrish = symmetricEncryptHex(content, symkey);
  referencePointHex = tbut.bytesToHex(ABytes);
  encryptedContentHex = gibbrish;
  return {referencePointHex, encryptedContentHex};
};

export var asymmetricDecryptOld = async function(secrets, secretKeyHex) {
  var A, AHex, aBytes, content, gibbrishHex, kA, kBigInt, symkey;
  AHex = secrets.referencePointHex || secrets.referencePoint;
  gibbrishHex = secrets.encryptedContentHex || secrets.encryptedContent;
  if ((AHex == null) || (gibbrishHex == null)) {
    throw new Error("Invalid secrets Object!");
  }
  // a = Secret Key
  // k = sha512(a) -> hashToScalar
  // G = basePoint
  // B = kG = Public Key
  aBytes = tbut.hexToBytes(secretKeyHex);
  kBigInt = hashToScalar(sha512Bytes(aBytes));
  
  // {A,X} = secrets
  // A = lG = one time public reference point 
  // klG = lB = kA = shared secret
  // key = sha512(kAHex)
  // content = symmetricDecrypt(X, key)
  A = noble.Point.fromHex(AHex);
  kA = (await A.multiply(kBigInt));
  symkey = sha512Hex(kA.toHex());
  content = symmetricDecryptHex(gibbrishHex, symkey);
  return content;
};

export var asymmetricEncrypt = async function(content, publicKeyHex) {
  var A, encryptedContentHex, gibbrish, lB, nBytes, referencePointHex, symkey;
  nBytes = noble.utils.randomPrivateKey();
  A = (await noble.getPublicKey(nBytes));
  lB = (await noble.getSharedSecret(nBytes, publicKeyHex));
  symkey = sha512Bytes(lB);
  // symkey = sha512Bytes(tbut.bytesToHex(lB))
  gibbrish = symmetricEncryptBytes(content, symkey);
  referencePointHex = tbut.bytesToHex(A);
  encryptedContentHex = tbut.bytesToHex(gibbrish);
  return {referencePointHex, encryptedContentHex};
};

export var asymmetricDecrypt = async function(secrets, secretKeyHex) {
  var AHex, content, gibbrishBytes, gibbrishHex, kA, symkey;
  AHex = secrets.referencePointHex || secrets.referencePoint;
  gibbrishHex = secrets.encryptedContentHex || secrets.encryptedContent;
  if ((AHex == null) || (gibbrishHex == null)) {
    throw new Error("Invalid secrets Object!");
  }
  kA = (await noble.getSharedSecret(secretKeyHex, AHex));
  symkey = sha512Bytes(kA);
  // symkey = sha512Bytes(tbut.bytesToHex(kA))
  gibbrishBytes = tbut.hexToBytes(gibbrishHex);
  content = symmetricDecryptBytes(gibbrishBytes, symkey);
  return content;
};

export var asymmetricEncryptHex = asymmetricEncrypt;

export var asymmetricDecryptHex = asymmetricDecrypt;

//###########################################################
// Byte Version
export var asymmetricEncryptBytes = async function(content, publicKeyBytes) {
  var ABytes, encryptedContentBytes, gibbrishBytes, lB, nBytes, referencePointBytes, symkeyBytes;
  nBytes = noble.utils.randomPrivateKey();
  ABytes = (await noble.getPublicKey(nBytes));
  lB = (await noble.getSharedSecret(nBytes, publicKeyBytes));
  symkeyBytes = sha512Bytes(lB);
  gibbrishBytes = symmetricEncryptBytes(content, symkeyBytes);
  referencePointBytes = ABytes;
  encryptedContentBytes = gibbrishBytes;
  return {referencePointBytes, encryptedContentBytes};
};

export var asymmetricDecryptBytes = async function(secrets, secretKeyBytes) {
  var ABytes, content, gibbrishBytes, kABytes, symkeyBytes;
  ABytes = secrets.referencePointBytes || secrets.referencePoint;
  gibbrishBytes = secrets.encryptedContentBytes || secrets.encryptedContent;
  if ((ABytes == null) || (gibbrishBytes == null)) {
    throw new Error("Invalid secrets Object!");
  }
  kABytes = (await noble.getSharedSecret(secretKeyBytes, ABytes));
  symkeyBytes = sha512Bytes(kABytes);
  content = symmetricDecryptBytes(gibbrishBytes, symkeyBytes);
  return content;
};

//endregion

//###########################################################
//region salts
export var createRandomLengthSalt = function() {
  var byte, bytes, i, j, len;
  while (true) {
    bytes = crypto.randomBytes(512);
    for (i = j = 0, len = bytes.length; j < len; i = ++j) {
      byte = bytes[i];
      if (byte === 0) {
        return bytes.slice(0, i + 1).toString("utf8");
      }
    }
  }
};

export var removeSalt = function(content) {
  var char, i, j, len;
  for (i = j = 0, len = content.length; j < len; i = ++j) {
    char = content[i];
    if (char === "\0") {
      return content.slice(i + 1);
    }
  }
  throw new Error("No Salt termination found!");
};


//endregion

//endregion
