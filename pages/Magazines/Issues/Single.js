import React, { Component } from 'react';
import cx from 'classnames';
import Dropzone from 'react-dropzone';
import { Router } from 'routes';
import Layout from 'components/Layout'

import Auth from 'api/Auth';
import * as Obj from 'lib/object';
import withAuth from 'lib/auth/withAuth';

const flatten = (data) => {
    return Obj.flatten(data);
};

const unflatten = (data) => {
    return Obj.unflatten(Object.assign({}, data));
};

class Single extends Component {
    state = {
        issue: {}
    };

    componentDidMount = () => {
        const issueId = this.props.url.query.issueId;

        this.setState({
            action: issueId ? 'edit' : 'create'
        });
        this.loadItem();
    };

    loadItem = async () => {
        const { issueId, magazineId } = this.props.url.query;

        const tokens = await Auth.getTokens();
        const requests = [
            fetch(`${LIBRARY_ENDPOINT}/v1/periodicals/${magazineId}`, {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`
                }
            })
        ];
        if (issueId) {
            requests.push(
                fetch(`${LIBRARY_ENDPOINT}/v1/periodicals/${magazineId}/issues/${issueId}`, {
                    headers: {
                        Authorization: `Bearer ${tokens.accessToken}`
                    }
                })
            );
        }

        const response = await Promise.all(requests);

        const magazine = await response[0].json();
        const issue = issueId ? await response[1].json() : {
            id: this.getId('0')
        };

        this.setState(
            {
                issue: { ...flatten(issue) },
                magazine
            }
        );
    };

    getId = (number) => {
        const magazineId = this.props.url.query.magazineId;

        return `${magazineId}-${String(number).padStart(4, '0')}`;
    };

    setValue = (key, value) => {
        this.setState({
            issue: {
                ...this.state.issue,
                [key]: value
            }
        });
    };
    setValues = (data, cb) => {
        this.setState({
            issue: {
                ...this.state.issue,
                ...data
            }
        }, cb);
    };

    handleInput = (event) => {
        const el = event.target;

        const readonly = this.state.action === 'create' ? [
            'id',
            'title'
        ] : [
            'id',
            'numberTotal'
        ];

        if (readonly.indexOf(el.name) !== -1) {
            return;
        }
        const state = {
            issue: this.state.issue
        };

        if (this.state.action === 'create') {
            let id = this.state.issue.id;
            if (el.name === 'numberTotal') {
                id = this.getId(el.value);
            }

            state.issue.id = id;
        }
        state.issue[el.name] = el.value;

        this.setState(state, this.updateTitle);
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

            const issue = await response.json();
            this.setState(
                {
                    issue: { ...flatten(issue) }
                }
            );
        };
        reader.readAsArrayBuffer(file);
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
        const data = unflatten(this.state.issue);
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
            <input className="pt-input" type="text" name={ name } value={ this.state.issue[name] || '' } onChange={ this.handleInput } { ...props }/>
        );
    };

    renderTextarea = (name) => {
        return (
            <textarea className="pt-input" name={ name } value={ this.state.issue[name] || '' } onChange={ this.handleInput }/>
        );
    };

    renderPublicationYear = () => {
        const { issue, action } = this.state;
        const selected = issue.publishYear;

        const onClick = (value) => {
            return () => {
                if (action === 'edit') {
                    return;
                }

                this.setValue('publishYear', value);
            }
        };

        const range = (start, end) => Array.from({length: (end - start + 1)}, (v, k) => k + start);
        const options = range(2005, 2017).reverse().map((num) => {
            const buttonClass = cx({
                'pt-button': true,
                'pt-active': selected === num,
                'pt-intent-primary': true
            });

            return (
                <button type="button" className={ buttonClass } onClick={ onClick(num) } key={ `py-${num}` }>{ num }</button>
            );
        });

        return (
            <div className="app-button-group">
                <label className="pt-label">
                    Год публикации
                </label>
                <div className="pt-button-group">
                    { options }
                </div>
            </div>
        );
    };

    renderYearNums = () => {
        const { issue, magazine } = this.state;

        if (!issue.publishYear) {
            return null;
        }

        let limit = 0;
        switch (magazine.info.freq) {
            case 'monthly': limit = 12; break;
            case 'quarterly': limit = 4; break;
        }
        if (limit === 0) {
            return null;
        }
        const selected = issue.numberYear;

        const onClick = (value) => {
            return () => {
                if (action === 'edit') {
                    return;
                }

                const numberTotal = magazine.issues.reduce((result, item) => {
                    if (item.publishYear === issue.publishYear && item.numberYear < value && item.numberTotal > result) {
                        const diff = value - item.numberYear;
                        return item.numberTotal + diff;
                    }

                    return result;
                }, null);

                this.setValues({
                    numberYear: value,
                    numberTotal
                }, this.updateTitle);
            }
        };

        const usedNumbers = magazine.issues.reduce((result, item) => {
            if (item.publishYear === issue.publishYear) {
                result.push(item.numberYear);
            }

            return result;
        }, []);

        const range = (start, end) => Array.from({length: (end - start)}, (v, k) => k + start);
        const options = range(1, limit + 1).map((num) => {
            const buttonClass = cx({
                'pt-button': true,
                'pt-active': selected === num,
                'pt-intent-primary': true
            });

            const disabled = selected !== num && usedNumbers.indexOf(num) !== -1;

            return (
                <button
                    type="button"
                    className={ buttonClass }
                    onClick={ onClick(num) }
                    key={ `ny-${num}` }
                    disabled={ disabled }
                >
                    { num }
                </button>
            );
        });

        return (
            <div className="app-button-group">
                <label className="pt-label">
                    Номер в году
                </label>
                <div className="pt-button-group">
                    { options }
                </div>
            </div>
        );
    };

    updateTitle = () => {
        const { issue } = this.state;

        if (!issue.numberYear || !issue.numberTotal || !issue.publishYear) {
            return;
        }

        const title = `№${issue.numberYear} (${issue.numberTotal}) ${issue.publishYear}`;
        this.setState({
            issue: {
                ...issue,
                title
            }
        }, this.updateId);
    };
    updateId = () => {
        const { action, issue } = this.state;

        if (action !== 'create' || !issue.numberTotal) {
            return;
        }

        this.setState({
            issue: {
                ...issue,
                id: this.getId(issue.numberTotal)
            }
        });
    };

    render = () => {
        const { issue, action } = this.state;

        const issue$ = unflatten(issue);
        // const pdf = issue$.attachments && issue$.attachments.find((el) => {
        //     return el.type === 'public'
        // });
        const pdf = issue['attachments.0.type'] === 'public' ? issue$.attachments[0] : null;
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

        const attachment$ = action === 'edit' ? [
            (
                <h2 key="attachment-title">Файлы</h2>
            ),
            (
                <div className="pt-card pt-elevation-1" key="attachment-el">
                    <label className="pt-label attachment-label">
                        PDF
                    </label>
                    { pdfComponent }
                </div>
            )
        ] : null;

        const canSave = !!issue.numberTotal && issue.title;

        return action === 'create' || issue.id ? (
            <Layout>
                <div className="app-edit">
                    <h1>Выпуск <span>{ issue.title }</span></h1>
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
                            { this.renderPublicationYear() }
                            { this.renderYearNums() }
                            <label className="pt-label">
                                Номер общий
                                { this.renderInput('numberTotal') }
                            </label>
                        </div>
                        { attachment$ }
                        <div className="controls">
                            <button type="button" className="pt-button pt-large pt-intent-success" onClick={ this.handleSave } disabled={ !canSave }>Сохранить</button>
                            <button type="button" className="pt-button pt-large" onClick={ this.handleCancel }>Отмена</button>
                        </div>
                    </form>
                </div>
            </Layout>
            ) : null;
    }
}

export default withAuth(Single);
