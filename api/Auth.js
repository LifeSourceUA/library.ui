class Auth {
    static url = `${AUTH_ENDPOINT}/v1/token`;

    static async getTokens() {
        let tokens = JSON.parse(localStorage.getItem('Hope.Auth'));

        if (!tokens) {
            return null;
        }

        if (new Date(tokens.expire) < new Date()) {
            tokens = await this.refreshToken(tokens.refreshToken);
            localStorage.setItem('Hope.Auth', JSON.stringify(tokens));
            console.log('Token updated');
        }

        return tokens;
    }

    static async refreshToken(refreshToken) {
        const params = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        };
        const body = Object.keys(params).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');

        const response = await fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body
        });
        const tokens = await response.json();

        return tokens;
    }
}

export default Auth;
