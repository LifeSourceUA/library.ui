import React, { Component } from 'react';
import cx from 'classnames';
import { Router } from 'routes';
import Layout from 'components/Layout'
import * as Obj from 'lib/object';
import Auth from 'api/Auth';
import withAuth from 'lib/auth/withAuth';

const idPrefix = 'N.';

class Single extends Component {
    state = {
        item: {
            id: idPrefix
        }
    };

    componentDidMount = async () => {
        const periodicalId = this.props.url.query.periodicalId;

        let action = 'create';

        if (periodicalId) {
            action = 'edit';

            const tokens = await Auth.getTokens();
            const response = await fetch(`${LIBRARY_ENDPOINT}/v1/periodicals/${periodicalId}?type=newspaper`, {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`
                }
            });

            const item = await response.json();
            this.setState(
                {
                    item: { ...Obj.flatten(item) }
                }
            );
        }
        this.setState({ action });
    };

    setValue = (key, value) => {
        this.setState({
            item: {
                ...this.state.item,
                [key]: value
            }
        });
    };

    handleInput = (event) => {
        const el = event.target;

        let value = el.value;
        if (el.name === 'id' && !value.match(idPrefix)) {
            value = `${idPrefix}${value}`;
        }

        this.setValue(el.name, value);
    };

    handleSave = async () => {
        const data = Obj.unflatten(this.state.item);
        data.type = 'newspaper';
        const action = this.state.action;

        let url = `${LIBRARY_ENDPOINT}/v1/periodicals?type=newspaper`;
        if (action === 'edit') {
            url += `/${data.id}`;
        }

        const tokens = await Auth.getTokens();
        await fetch(url, {
            method: action === 'create' ? 'POST' : 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokens.accessToken}`
            },
            body: JSON.stringify(data)
        });

        Router.pushRoute('newspapers-list');
    };

    handleCancel = () => {
        Router.pushRoute('newspapers-list');
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

    renderFreq = () => {
        const { item } = this.state;
        const selected = item['info.freq'];

        const onClick = (value) => {
            return () => {
                this.setValue('info.freq', value);
            }
        };

        const options = [
            {
                id: 'monthly',
                title: 'ежемесячно'
            },
            {
                id: 'quarterly',
                title: 'ежеквартально'
            }
        ].map((item) => {
            const buttonClass = cx({
                'pt-button': true,
                'pt-active': selected === item.id,
                'pt-intent-primary': true
            });

            return (
                <button type="button" className={ buttonClass } onClick={ onClick(item.id) } key={ item.id }>{ item.title }</button>
            )
        });

        return (
            <div className="pt-button-group">
                { options }
            </div>
        );
    };

    render = () => {
        const { item, action } = this.state;

        return action === 'create' || item.id ? (
            <Layout>
                <div className="app-edit">
                    <h1>Газета <span>{ item.title }</span></h1>
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
                            </label>
                            { this.renderFreq() }
                        </div>
                        <div className="controls">
                            <button type="button" className="pt-button pt-large pt-intent-success" onClick={ this.handleSave }>Сохранить</button>
                            <button type="button" className="pt-button pt-large" onClick={ this.handleCancel }>Отмена</button>
                        </div>
                    </form>
                </div>
            </Layout>
        ) : null;
    };
}

export default withAuth(Single);
