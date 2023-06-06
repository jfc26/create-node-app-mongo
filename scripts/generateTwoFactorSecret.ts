import * as speakeasy from 'speakeasy';




function generateTwoFactorSecret(){
    const result = speakeasy.generateSecret({
        name: 'Sample (root)',
    });

    console.dir(result, {depth: Infinity});
}

generateTwoFactorSecret();