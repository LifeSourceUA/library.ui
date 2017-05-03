class Auth {
    static endpoint = `${AUTH_ENDPOINT}/v1/token`;

    static async getTokens() {
        let tokens = JSON.parse(localStorage.getItem('Hope.Auth'));

        if (!tokens || !tokens.accessToken) {
            return null;
        }

        if (new Date(tokens.expire) < new Date()) {
            tokens = await this.refreshToken(tokens.refreshToken);

            if (tokens) {
                localStorage.setItem('Hope.Auth', JSON.stringify(tokens));
                console.log('Token updated');
            } else {
                localStorage.removeItem('Hope.Auth');
                console.log('Token cleared');
            }
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

        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body
        });
        const result = await response.json();

        if (!result || !result.accessToken) {
            return null;
        }

        return result;
    }

    static async login(email, password) {
        const params = {
            grant_type: 'password',
            username: email,
            password
        };
        const body = Object.keys(params).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');

        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body
        });

        const result = await response.json();

        if (!result.accessToken) {
            throw new Error('No token');
        }
        localStorage.setItem('Hope.Auth', JSON.stringify(result));
    };
}

export default Auth;
