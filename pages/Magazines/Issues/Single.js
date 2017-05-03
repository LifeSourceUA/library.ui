import React, { Component } from 'react';
import { DateInput } from "@blueprintjs/datetime";
import Moment from 'moment';
import Dropzone from 'react-dropzone';
import { Router } from 'routes';
import Layout from 'components/Layout'

import Auth from 'api/Auth';
import * as Obj from 'lib/object';
import withAuth from 'lib/auth/withAuth';

const flatten = (data) => {
    const result = Obj.flatten(data);
    result.publishDate = Moment(data.publishDate).hour(0).minute(0).second(0).toDate();

    return result;
};

const unflatten = (data) => {
    const result = Object.assign({}, data);
    result.publishDate = Moment(result.publishDate).format('YYYY-MM-DD');

    return Obj.unflatten(result);
};

class Single extends Component {
    state = {
        item: {}
    };

    componentDidMount = () => {
        const issueId = this.props.url.query.issueId;
        let action = 'create';

        if (issueId) {
            action = 'edit';
            this.loadItem();
        }
        this.setState({ action });
    };

    loadItem = async () => {
        const { issueId, magazineId } = this.props.url.query;

        const tokens = await Auth.getTokens();
        const response = await fetch(`${LIBRARY_ENDPOINT}/v1/periodicals/${magazineId}/issues/${issueId}`, {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        });
        const item = await response.json();
        this.setState(
            {
                item: { ...flatten(item) }
            }
        );
    };

    handleInput = (event) => {
        const el = event.target;

        this.setState({
            item: {
                ...this.state.item,
                [el.name]: el.value
            }
        });
    };

    handleDateInput = (name) => {
        return (date) => {
            this.setState({
                item: {
                    ...this.state.item,
                    [name]: date
                }
            })
        };
    };

    handleDrop = (acceptedFiles) => {
        const issueId = this.props.url.query.issueId;
        const magazineId = this.props.url.query.magazineId;

        const [file] = acceptedFiles;
        if (file.type !== 'application/pdf') {
            return false;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const tokens = await Auth.getTokens();
            const response = await fetch(`${LIBRARY_ENDPOINT}/v1/periodicals/${magazineId}/issues/${issueId}/attachments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    Authorization: `Bearer ${tokens.accessToken}`
                },
                body: e.target.result
            });

            if (response.status !== 201) {
                console.error('Ошибка загрузки файла');

                return false;
            }

            const item = await response.json();
            this.setState(
                {
                    item: { ...flatten(item) }
                }
            );
        };
        reader.readAsText(file, 'utf-8');
    };

    removeAttachment = (attachmentId) => async (event) => {
        event.preventDefault();

        const { issueId, magazineId } = this.props.url.query;

        const url = `${LIBRARY_ENDPOINT}/v1/periodicals/${magazineId}/issues/${issueId}/attachments/${attachmentId}`;

        const tokens = await Auth.getTokens();
        await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokens.accessToken}`
            }
        });

        this.loadItem();
    };

    handleSave = async () => {
        const data = unflatten(this.state.item);
        const action = this.state.action;

        const issueId = this.props.url.query.issueId;
        const magazineId = this.props.url.query.magazineId;

        let url = `${LIBRARY_ENDPOINT}/v1/periodicals/${magazineId}/issues`;
        if (action === 'edit') {
            url += `/${issueId}`;
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

        Router.pushRoute('magazines-issues-list', {
            magazineId
        });
    };

    handleCancel = () => {
        const magazineId = this.props.url.query.magazineId;
        Router.pushRoute('magazines-issues-list', {
            magazineId
        });
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

    renderDate = (name) => {
        return (
            <DateInput value={ this.state.item[name] } onChange={ this.handleDateInput(name) } />
        );
    };

    render = () => {
        const { item, action } = this.state;

        const item$ = unflatten(item);
        // const pdf = item$.attachments && item$.attachments.find((el) => {
        //     return el.type === 'public'
        // });
        const pdf = item['attachments.0.type'] === 'public' ? item$.attachments[0] : null;
        const pdfComponent = pdf ? (
                <div className="attachment-actions">
                    <a href={ pdf.location }>Скачать PDF</a>
                    <a href="#" onClick={ this.removeAttachment(pdf.id) }>Удалить</a>
                </div>
            ) : (
                <Dropzone onDrop={ this.handleDrop }>
                    <div className="dropzone-inner">Перетащите файл в эту область</div>
                </Dropzone>
            );

        return action === 'create' || item.id ? (
            <Layout>
                <div className="app-edit">
                    <h1>Выпуск <span>{ item.title }</span></h1>
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
                        <h2>Публикация</h2>
                        <div className="pt-card pt-elevation-1">
                            <label className="pt-label">
                                Дата публикации
                            </label>
                            { this.renderDate('publishDate') }
                            <label className="pt-label">
                                Номер в году
                                { this.renderInput('numbers.year') }
                            </label>
                            <label className="pt-label">
                                Номер общий
                                { this.renderInput('numbers.total') }
                            </label>
                        </div>
                        <h2>Файлы</h2>
                        <div className="pt-card pt-elevation-1">
                            <label className="pt-label attachment-label">
                                PDF
                            </label>
                            { pdfComponent }
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

export default withAuth(Single);
