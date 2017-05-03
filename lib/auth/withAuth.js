import React, { Component } from 'react';

import { Link, Router } from 'routes';
import Auth from 'api/Auth';

export default function withAuth(AuthComponent) {
    return class Authenticated extends Component {
        state = {
            isLoading: true
        };

        async componentDidMount () {
            const tokens = await Auth.getTokens();
            if (!tokens) {
                return Router.pushRoute('login');
            }

            this.setState({ isLoading: false });
        }

        render() {
            return (
                <div>
                    { this.state.isLoading ? (
                        <div>LOADING....</div>
                    ) : (
                        <AuthComponent { ...this.props }  auth={ Auth } />
                    ) }
                </div>
            )
        }
    }
}
