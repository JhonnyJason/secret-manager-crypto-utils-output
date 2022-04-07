// Generated by CoffeeScript 2.6.1
var algorithm, cryptoutilsnode, hashToScalar, sha256, sha512;

cryptoutilsnode = {};

import * as noble from "@noble/ed25519";

import * as tbut from "thingy-byte-utils";

import crypto from "crypto";

//###########################################################
//region internalProperties
algorithm = 'aes-256-cbc';

//endregion

//###########################################################
//region internalFunctions
hashToScalar = function(hash) {
  var relevant;
  relevant = hash.slice(0, 32);
  relevant[0] &= 248;
  relevant[31] &= 127;
  relevant[31] |= 64;
  return tbut.bytesToBigInt(relevant);
};

sha256 = function(content) {
  var hasher;
  hasher = crypto.createHash("sha256");
  hasher.update(content);
  return hasher.digest();
};

sha512 = function(content) {
  var hasher;
  hasher = crypto.createHash("sha512");
  hasher.update(content);
  return hasher.digest();
};

//endregion

//###########################################################
//region exposedStuff

//###########################################################
//region shas
export var sha256Hex = function(content) {
  return tbut.bytesToHex(sha256(content));
};

export var sha512Hex = function(content) {
  return tbut.bytesToHex(sha512(content));
};

//###########################################################
export var sha256Bytes = sha256;

export var sha512Bytes = sha512;

//endregion

//###########################################################
//region keys
export var getNewKeyPair = async function() {
  var publicKey, publicKeyHex, secretKey, secretKeyHex;
  secretKey = noble.utils.randomPrivateKey();
  publicKey = (await noble.getPublicKey(secretKey));
  secretKeyHex = tbut.bytesToHex(secretKey);
  publicKeyHex = tbut.bytesToHex(publicKey);
  return {secretKeyHex, publicKeyHex};
};

//endregion

//###########################################################
//region signatures
export var createSignature = async function(content, signingKeyHex) {
  var hashHex, signature;
  hashHex = this.sha256Hex(content);
  signature = (await noble.sign(hashHex, signingKeyHex));
  return tbut.bytesToHex(signature);
};

export var verify = async function(sigHex, keyHex, content) {
  var hashHex;
  hashHex = this.sha256Hex(content);
  return (await noble.verify(sigHex, hashHex, keyHex));
};

//endregion

//###########################################################
//region encryption
export var asymetricEncrypt = async function(content, publicKeyHex) {
  var AHex, B, BHex, encryptedContent, gibbrish, lB, lBigInt, nBytes, nHex, referencePoint, symkey;
  // a = Private Key
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
  // X = symetricEncrypt(content, key)
  // A = lG = one time public reference point
  // {A,X} = data to be stored for B

  // n = one-time secret
  nBytes = noble.utils.randomPrivateKey();
  nHex = tbut.bytesToHex(nBytes);
  lBigInt = hashToScalar(sha512(nBytes));
  // log lBigInt

  //A one time public key = reference Point
  AHex = (await noble.getPublicKey(nHex));
  lB = (await B.multiply(lBigInt));
  symkey = this.sha512Hex(lB.toHex());
  gibbrish = this.symetricEncryptHex(content, symkey);
  referencePoint = AHex;
  encryptedContent = gibbrish;
  return {referencePoint, encryptedContent};
};

export var asymetricDecrypt = async function(secrets, privateKeyHex) {
  var A, AHex, aBytes, content, gibbrishHex, kA, kBigInt, symkey;
  if ((secrets.referencePoint == null) || (secrets.encryptedContent == null)) {
    throw new Error("unexpected secrets format!");
  }
  // a = Private Key
  // k = sha512(a) -> hashToScalar
  // G = basePoint
  // B = kG = Public Key
  aBytes = tbut.hexToBytes(privateKeyHex);
  kBigInt = hashToScalar(sha512(aBytes));
  
  // {A,X} = secrets
  // A = lG = one time public reference point 
  // klG = lB = kA = shared secret
  // key = sha512(kAHex)
  // content = symetricDecrypt(X, key)
  AHex = secrets.referencePoint;
  A = noble.Point.fromHex(AHex);
  kA = (await A.multiply(kBigInt));
  symkey = this.sha512Hex(kA.toHex());
  gibbrishHex = secrets.encryptedContent;
  content = this.symetricDecryptHex(gibbrishHex, symkey);
  return content;
};

//###########################################################
export var symetricEncryptHex = function(content, keyHex) {
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

export var symetricDecryptHex = function(gibbrishHex, keyHex) {
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
