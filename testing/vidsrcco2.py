import base64
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256

data = {"algorithm":"aes-256-cbc","iterations":1000,"salt":r"0cba892dfb375870bbb3d70d012089ff","iv":r"806c540a157b731ee4e4ef51cd614b90","encryptedData":r"lotsofencrypteddatawouldbehere","key":r"3feda709b6f24c5a63d10945ff84af216a60562f571ab2a376c714d58929ddd2"}

salt = bytes.fromhex(data['salt'])
iv = bytes.fromhex(data['iv'])
encrypted_data = base64.b64decode(data['encryptedData'])
password = data['key']
iterations = data['iterations']

derived_key = PBKDF2(password, salt, dkLen=32, count=iterations, hmac_hash_module=SHA256)

cipher = AES.new(derived_key, AES.MODE_CBC, iv)

plaintext_padded = cipher.decrypt(encrypted_data)
padding_len = plaintext_padded[-1]
plaintext = plaintext_padded[:-padding_len]

print(plaintext.decode('utf-8'))