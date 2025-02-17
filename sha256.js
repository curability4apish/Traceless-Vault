var sha256 = {};

sha256.digest = function(str) {
    // Step 1: Convert the string to bytes, then pad it
    let bs = this.padding(this.toBytes(str));
    // Step 2: Convert the padded byte array to words
    let ws = this.toWords(bs);
    // Step 3: Process the words and return the final digest
    let digest = this.process(ws);
    
    return digest;
};

sha256.toBytes = function(str) {
    let result = [];
    // Convert each character in the string to its ASCII byte value
    for (let i = 0; i < str.length; ++i) {
        result.push(str.charCodeAt(i));
    }
    return result;
};

sha256.padding = function(bs) {
    let len = bs.length * 8;  // Length of the input message in bits
    let padLen = (Math.ceil((len + 65) / 512) * 512 - 64 - len) / 8;  // Calculate the padding length

    bs.push(0x80);  // Add the 0x80 byte (0x10000000 in binary, the padding indicator)
    
    // Add zero bytes until the message is 64 bits short of a multiple of 512 bits
    for (let i = 1; i < padLen; ++i) {
        bs.push(0);
    }
    
    // Add the 64-bit length of the original message (high 32 bits and low 32 bits)
    for (let i = 0; i < 4; ++i) {
        bs.push(0);
    }
    for (let i = 0; i < 4; ++i) {
        bs.push((len >> 8 * (3 - i)) & 0xff);
    }
    
    return bs;
};

sha256.toWords = function(bs) {
    let len = bs.length / 4;
    let ws = [];
    // Convert the byte array into 32-bit words
    for (let i = 0; i < len; ++i) {
        ws[i] = 0;
        for (let j = 0; j < 4; ++j) {
            ws[i] |= (bs[i * 4 + j] << ((3 - j) * 8));
        }
    }
    return ws;
};

sha256.process = function(ws) {
    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;
    let a, b, c, d, e, f, g, h;

    // Process each 512-bit block (16 words)
    for (let wi = 0; wi < ws.length; wi += 16) {
        let w = [];
        for (let i = 0; i < 16; ++i) {
            w[i] = ws[wi + i];
        }

        // Extend the 16 words into 64 words
        for (let i = 16; i < 64; ++i) {
            let s0 = this.rotr(w[i - 15], 7) ^ this.rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
            let s1 = this.rotr(w[i - 2], 17) ^ this.rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        }

        // Initialize the working variables
        a = h0;
        b = h1;
        c = h2;
        d = h3;
        e = h4;
        f = h5;
        g = h6;
        h = h7;

        // Main loop (64 rounds)
        for (let i = 0; i < 64; ++i) {
            let s1 = this.rotr(e, 6) ^ this.rotr(e, 11) ^ this.rotr(e, 25);
            let ch = (e & f) ^ ((~e) & g);
            let temp1 = (h + s1 + ch + this.k[i] + w[i]) | 0;
            let s0 = this.rotr(a, 2) ^ this.rotr(a, 13) ^ this.rotr(a, 22);
            let maj = (a & b) ^ (a & c) ^ (b & c);
            let temp2 = (s0 + maj) | 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) | 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) | 0;
        }

        // Update the hash values
        h0 = (h0 + a) | 0;
        h1 = (h1 + b) | 0;
        h2 = (h2 + c) | 0;
        h3 = (h3 + d) | 0;
        h4 = (h4 + e) | 0;
        h5 = (h5 + f) | 0;
        h6 = (h6 + g) | 0;
        h7 = (h7 + h) | 0;
    }

    // Return the final hash (digest)
    return [h0, h1, h2, h3, h4, h5, h6, h7];
};

sha256.rotr = function(w, len) {
    // Right rotation (circular shift) function
    return (w >>> len) | (w << (32 - len));
};

sha256.k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

var wrapper = {};

wrapper.wrap16 = function(ws, chars, length) {
    chars = chars || '0123456789abcdef';
    // Ensure chars is long enough
    while (chars.length < 16) {
        chars += chars;
    }
    
    let result = '';
    // Convert each word into a hexadecimal string
    ws.forEach((w) => {
        for (let i = 0; i < 8; ++i) {
            let ci = (w >> ((7 - i) * 4)) & 0xf;
            result += chars[ci];
        }
    });

    // Truncate to the desired length if specified
    if (length) {
        result = result.substring(0, length);
    }
    return result;
};

wrapper.wrap64 = function(ws, chars, length) {
    chars = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._';
    // Ensure chars is long enough
    while (chars.length < 64) {
        chars += chars;
    }
    
    let result = '';
    let bs = [];
    // Split each word into two 16-bit parts
    ws.forEach((w) => {
        bs.push((w >> 16) & 0xffff);
        bs.push(w & 0xffff);
    });
    bs.reverse();
    
    let buffer = 0;
    let bufferLen = 0;
    
    bs.forEach((b, i, a) => {
        buffer |= (b << bufferLen);
        bufferLen += 16;
        while (bufferLen >= ((i >= a.length - 1) ? 1 : 6)) {
            result = chars[buffer & 0x3f] + result;
            buffer >>= 6;
            bufferLen -= 6;
        }
    });

    // Truncate to the desired length if specified
    if (length) {
        result = result.substring(0, length);
    }
    return result;
};
