import React, { Component } from 'react';

import { Router } from 'routes';
import Layout from 'components/Layout'
import * as Obj from 'lib/object';
import Auth from 'api/Auth';

class Single extends Component {
    state = {
        item: {}
    };

    componentDidMount() {
        const magazineId = this.props.url.query.magazineId;
        let action = 'create';

        if (magazineId) {
            action = 'edit';

            Auth.getTokens().then((tokens) => {
                return fetch(`http://localhost:3000/v1/periodicals/${magazineId}?type=magazine`, {
                    headers: {
                        Authorization: `Bearer ${tokens.accessToken}`
                    }
                })
            })
                .then((response) => {
                    return response.json();
                })
                .then((item) => {
                    this.setState(
                        {
                            item: { ...Obj.flatten(item) }
                        }
                    );
                });
        }
        this.setState({ action });
    }

    handleInput = (event) => {
        const el = event.target;

        this.setState({
            item: {
                ...this.state.item,
                [el.name]: el.value
            }
        });
    };

    handleSave = () => {
        const data = Obj.unflatten(this.state.item);
        data.type = 'magazine';
        const action = this.state.action;

        let url = `http://localhost:3000/v1/periodicals?type=magazine`;
        if (action === 'edit') {
            url += `/${data.id}`;
        }

        Auth.getTokens().then((tokens) => {
            return fetch(url, {
                method: action === 'create' ? 'POST' : 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tokens.accessToken}`
                },
                body: JSON.stringify(data)
            });
        })
        .then((response) => {
            Router.pushRoute('magazines-list');
        }).catch((error) => {
            console.error(error);
        });
    };

    handleCancel = () => {
        Router.pushRoute('magazines-list');
    };

    renderInput = (name, props) => {
        return (
            <input className="pt-input" type="text" name={ name } value={ this.state.item[name] || '' } onChange={ this.handleInput } { ...props }/>
        );
    };

    renderTextarea = (name) => {
        return (
            <textarea className="pt-input" name={ name } value={ this.state.item[name] || '' } onChange={ this.handleInput }/>
        );
    };

    render() {
        const { item, action } = this.state;

        return action === 'create' || item.id ? (
            <Layout>
                <div className="app-edit">
                    <h1>Журнал <span>{ item.title }</span></h1>
                    <form>
                        <div className="pt-card pt-elevation-1">
                            <label className="pt-label">
                                ID
                                { this.renderInput('id', { disabled: action === 'edit' }) }
                            </label>
                            <label className="pt-label">
                                Название
                                { this.renderInput('title') }
                            </label>
                            <label className="pt-label">
                                Описание
                                { this.renderTextarea('description') }
                            </label>
                        </div>
                        <h2>Информация</h2>
                        <div className="pt-card pt-elevation-1">
                            <label className="pt-label">
                                Количество страниц
                                { this.renderInput('info.pages') }
                            </label>
                            <label className="pt-label">
                                Тираж
                                { this.renderInput('info.copies') }
                            </label>
                            <label className="pt-label">
                                Бумага
                                { this.renderInput('info.paper') }
                            </label>
                            <label className="pt-label">
                                Периодичность
                                { this.renderInput('info.freq') }
                            </label>
                        </div>
                        <div className="controls">
                            <button type="button" className="pt-button pt-large pt-intent-success" onClick={ this.handleSave }>Сохранить</button>
                            <button type="button" className="pt-button pt-large" onClick={ this.handleCancel }>Отмена</button>
                        </div>
                    </form>
                </div>
            </Layout>
        ) : null;
    }
}

export default Single;
