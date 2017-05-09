import React, { Component } from 'react';

import { Link, Router } from 'routes';
import Layout from 'components/Layout';
import Auth from 'api/Auth';

class Login extends Component {
    state = {
        user: null,
        error: null,
        form: {}
    };

    handleLogin = async () => {
        const { login, password } = this.state.form;
        try {
            await Auth.login(login, password);
        } catch (error) {
            console.error(error);
            this.setState({
                error: 'Не правильный логин или пароль',
                form: {
                    ...this.state.form,
                    password: ''
                }
            })
        }

        Router.pushRoute('home');
    };

    handleInput = (event) => {
        const el = event.target;

        this.setState({
            form: {
                ...this.state.form,
                [el.name]: el.value
            }
        });
    };

    renderInput = (name, props = {}) => {
        return (
            <input className="pt-input" type={ props.type || 'text' } name={ name } value={ this.state.form[name] || '' } onChange={ this.handleInput } { ...props }/>
        );
    };

    render() {
        const { error } = this.state;

        return (
            <Layout>
                <div className="app-login">
                    <h1>Вход</h1>
                    <p className="error-message">{ error }</p>
                    <form>
                        <div className="pt-card pt-elevation-1">
                            <label className="pt-label">
                                Имя
                                { this.renderInput('login') }
                            </label>
                            <label className="pt-label">
                                Пароль
                                { this.renderInput('password', { type: 'password' }) }
                            </label>
                        </div>
                        <div className="controls">
                            <button type="button" className="pt-button pt-large pt-intent-success" onClick={ this.handleLogin }>Войти</button>
                        </div>
                    </form>
                </div>
            </Layout>
        );
    }
}

export default Login;
