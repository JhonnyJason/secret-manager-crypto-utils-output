// Generated by CoffeeScript 2.6.1
//###########################################################
var createKeyObject, crypto, hashToScalar;

import * as noble from "@noble/ed25519";

import * as tbut from "thingy-byte-utils";

crypto = window.crypto.subtle;

//###########################################################
//region internalFunctions
hashToScalar = function(byteBuffer) {
  var relevant;
  relevant = new Uint8Array(byteBuffer.slice(0, 32));
  relevant[0] &= 248;
  relevant[31] &= 127;
  relevant[31] |= 64;
  return tbut.bytesToBigInt(relevant.buffer);
};

createKeyObject = async function(keyHex) {
  var keyBuffer;
  keyBuffer = tbut.hexToBytes(keyHex);
  return (await crypto.importKey("raw", keyBuffer, {
    name: "AES-CBC"
  }, false, ["decrypt", "encrypt"]));
};

//endregion

//###########################################################
//region exposedStuff

//###########################################################
//region shas
export var sha256Hex = async function(content) {
  var contentBytes, hashBytes;
  if ((typeof content) === "string") {
    contentBytes = tbut.utf8ToBytes(content);
  } else {
    contentBytes = content;
  }
  hashBytes = (await crypto.digest("SHA-256", contentBytes));
  return tbut.bytesToHex(hashBytes);
};

export var sha512Hex = async function(content) {
  var contentBytes, hashBytes;
  if ((typeof content) === "string") {
    contentBytes = tbut.utf8ToBytes(content);
  } else {
    contentBytes = content;
  }
  hashBytes = (await crypto.digest("SHA-512", contentBytes));
  return tbut.bytesToHex(hashBytes);
};

//###########################################################
export var sha256Bytes = async function(content) {
  var contentBytes;
  if ((typeof content) === "string") {
    contentBytes = tbut.utf8ToBytes(content);
  } else {
    contentBytes = content;
  }
  return (await crypto.digest("SHA-256", contentBytes));
};

export var sha512Bytes = async function(content) {
  var contentBytes;
  if ((typeof content) === "string") {
    contentBytes = tbut.utf8ToBytes(content);
  } else {
    contentBytes = content;
  }
  return (await crypto.digest("SHA-512", contentBytes));
};

//endregion

//###########################################################
//region salts
export var createRandomLengthSalt = function() {
  var byte, bytes, i, j, len;
  bytes = new Uint8Array(512);
  while (true) {
    window.crypto.getRandomValues(bytes);
    for (i = j = 0, len = bytes.length; j < len; i = ++j) {
      byte = bytes[i];
      if (byte === 0) {
        return tbut.bufferToUtf8(bytes.slice(0, i + 1));
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

//###########################################################
//region encryption
export var asymetricEncrypt = async function(content, publicKeyHex) {
  var AHex, B, BHex, encryptedContent, gibbrish, lB, lBigInt, nBytes, nHashed, nHex, referencePoint, symkeyHex;
  // a = Private Key
  // k = @sha512Bytes(a) -> hashToScalar
  // G = basePoint
  // B = kG = Public Key
  B = noble.Point.fromHex(publicKeyHex);
  BHex = publicKeyHex;
  // log "BHex: " + BHex

  // n = new one-time secret (generated on sever and forgotten about)
  // l = @sha512Bytes(n) -> hashToScalar
  // lB = lkG = shared secret
  // key = @sha512Bytes(lBHex)
  // X = symetricEncrypt(content, key)
  // A = lG = one time public reference point
  // {A,X} = data to be stored for B

  // n = one-time secret
  nBytes = noble.utils.randomPrivateKey();
  nHex = tbut.bytesToHex(nBytes);
  nHashed = (await this.sha512Bytes(nBytes));
  lBigInt = hashToScalar(nHashed);
  // log lBigInt

  //A one time public key = reference Point
  AHex = (await noble.getPublicKey(nHex));
  lB = (await B.multiply(lBigInt));
  
  //# TODO generate AES key
  symkeyHex = (await this.sha512Hex(lB.toHex()));
  gibbrish = (await this.symetricEncryptHex(content, symkeyHex));
  referencePoint = AHex;
  encryptedContent = gibbrish;
  return {referencePoint, encryptedContent};
};

export var asymetricDecrypt = async function(secrets, privateKeyHex) {
  var A, AHex, aBytes, aHashed, content, gibbrishHex, kA, kBigInt, symkeyHex;
  if ((secrets.referencePoint == null) || (secrets.encryptedContent == null)) {
    throw new Error("unexpected secrets format!");
  }
  // a = Private Key
  // k = @sha512Bytes(a) -> hashToScalar
  // G = basePoint
  // B = kG = Public Key
  aBytes = tbut.hexToBytes(privateKeyHex);
  aHashed = (await this.sha512Bytes(aBytes));
  kBigInt = hashToScalar(aHashed);
  
  // {A,X} = secrets
  // A = lG = one time public reference point 
  // klG = lB = kA = shared secret
  // key = @sha512Bytes(kAHex)
  // content = symetricDecrypt(X, key)
  AHex = secrets.referencePoint;
  A = noble.Point.fromHex(AHex);
  kA = (await A.multiply(kBigInt));
  symkeyHex = (await this.sha512Hex(kA.toHex()));
  gibbrishHex = secrets.encryptedContent;
  content = (await this.symetricDecryptHex(gibbrishHex, symkeyHex));
  return content;
};

//###########################################################
export var symetricEncryptHex = async function(content, keyHex) {
  var aesKeyHex, algorithm, contentBuffer, gibbrishBuffer, ivBuffer, ivHex, key;
  ivHex = keyHex.substring(0, 32);
  aesKeyHex = keyHex.substring(32, 96);
  ivBuffer = tbut.hexToBytes(ivHex);
  contentBuffer = tbut.utf8ToBuffer(content);
  key = (await createKeyObject(aesKeyHex));
  algorithm = {
    name: "AES-CBC",
    iv: ivBuffer
  };
  gibbrishBuffer = (await crypto.encrypt(algorithm, key, contentBuffer));
  return tbut.bytesToHex(gibbrishBuffer);
};

export var symetricDecryptHex = async function(gibbrishHex, keyHex) {
  var aesKeyHex, algorithm, contentBuffer, gibbrishBuffer, ivBuffer, ivHex, key;
  ivHex = keyHex.substring(0, 32);
  aesKeyHex = keyHex.substring(32, 96);
  ivBuffer = tbut.hexToBytes(ivHex);
  gibbrishBuffer = tbut.hexToBytes(gibbrishHex);
  key = (await createKeyObject(aesKeyHex));
  algorithm = {
    name: "AES-CBC",
    iv: ivBuffer
  };
  contentBuffer = (await crypto.decrypt(algorithm, key, gibbrishBuffer));
  return tbut.bufferToUtf8(contentBuffer);
};

//endregion

//###########################################################
//region signatures
export var createSignature = async function(content, signingKeyHex) {
  var hashHex;
  hashHex = (await this.sha256Hex(content));
  return (await noble.sign(hashHex, signingKeyHex));
};

export var verify = async function(sigHex, keyHex, content) {
  var hashHex;
  hashHex = this.sha256Hex(content);
  return (await noble.verify(sigHex, hashHex, keyHex));
};

//endregion

//endregion
