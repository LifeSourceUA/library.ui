import React, { Component } from 'react';

import { Link } from 'routes';
import Layout from 'components/Layout'
import Auth from 'api/Auth';
import withAuth from 'lib/auth/withAuth';

class List extends Component {
    state = {
        items: [],
        parent: {},
        total: 0
    };

    componentDidMount = async () => {
        const periodicalId = this.props.url.query.periodicalId;

        const tokens = await Auth.getTokens();
        const response = await fetch(`${LIBRARY_ENDPOINT}/v1/periodicals/${periodicalId}/issues?limit=100`, {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        });

        const result = await response.json();
        this.setState({
            items: result.issues,
            parent: result.periodical,
            total: result.meta.total
        });
    };

    render = () => {
        const { parent } = this.state;

        const renderRow = (item) => {
            const routeParams = {
                periodicalId: parent.id,
                issueId: item.id
            };

            return (
                <tr key={ item.id }>
                    <td>{ item.id }</td>
                    <td>
                        <Link route="newspapers-issues-single" params={ routeParams }>
                            <a>{ item.title }</a>
                        </Link>
                    </td>
                </tr>
            );
        };

        const routeParams = {
            periodicalId: parent.id
        };
        const btnCreate = parent.id ? (
            <Link route="newspapers-issues-create" params={ routeParams }>
                <a className="pt-button pt-intent-primary pt-icon-add">Создать</a>
            </Link>
        ) : null;

        return (
            <Layout>
                <div className="list-head">
                    <h1>Выпуски газеты <span>{ parent.title }</span></h1>
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

export default withAuth(List);
