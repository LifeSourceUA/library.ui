import React, { Component } from 'react';

import { Link } from 'routes';
import Layout from 'components/Layout'
import Auth from 'api/Auth';

class List extends Component {
    state = {
        items: [],
        parent: {},
        total: 0
    };

    componentDidMount() {
        const magazineId = this.props.url.query.magazineId;

        Auth.getTokens().then((tokens) => {
            return fetch(`${LIBRARY_ENDPOINT}/v1/periodicals/${magazineId}/issues`, {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`
                }
            })
        })
            .then((response) => {
                return response.json();
            })
            .then((result) => {
                this.setState({
                    items: result.issues,
                    parent: result.periodical,
                    total: result.meta.total
                });
            });
    }

    render() {
        const { parent } = this.state;

        const renderRow = (item) => {
            const routeParams = {
                magazineId: parent.id,
                issueId: item.id
            };

            return (
                <tr key={ item.id }>
                    <td>{ item.id }</td>
                    <td>
                        <Link route="magazines-issues-single" params={ routeParams }>
                            <a>{ item.title }</a>
                        </Link>
                    </td>
                </tr>
            );
        };

        const routeParams = {
            magazineId: parent.id
        };
        const btnCreate = parent.id ? (
            <Link route="magazines-issues-create" params={ routeParams }>
                <a className="pt-button pt-intent-primary pt-icon-add">Создать</a>
            </Link>
        ) : null;

        return (
            <Layout>
                <div className="list-head">
                    <h1>Выпуски журнала <span>{ parent.title }</span></h1>
                    <div className="list-actions">
                        { btnCreate }
                    </div>
                </div>
                <table className="pt-table pt-interactive app-list">
                    <thead>
                    <tr>
                        <th className="app-list-id">ID</th>
                        <th className="app-list-title">Название</th>
                    </tr>
                    </thead>
                    <tbody>
                    { this.state.items.map(renderRow) }
                    </tbody>
                </table>
            </Layout>
        );
    };
};

export default List;
