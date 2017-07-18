import React, { Component } from 'react';

import { Link } from 'routes';
import Layout from 'components/Layout'
import Auth from 'api/Auth';
import withAuth from 'lib/auth/withAuth';

class List extends Component {
    state = {
        items: [],
        total: 0
    };

    componentDidMount = async () => {
        const tokens = await Auth.getTokens();
        const response = await fetch(`${LIBRARY_ENDPOINT}/v1/periodicals?type=magazine`, {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        });
        const result = await response.json();
        this.setState({
            items: result.periodicals,
            total: result.meta.total
        });
    };

    render = () => {
        const renderRow = (item) => {
            const routeParams = {
                periodicalId: item.id
            };

            return (
                <tr key={ item.id }>
                    <td>{ item.id }</td>
                    <td>
                        <Link route="magazines-issues-list" params={ routeParams }>
                            <a>{ item.title }</a>
                        </Link>
                    </td>
                    <td>
                        <Link route="magazines-single" params={ routeParams }>
                            <a className="pt-icon-large pt-icon-edit"/>
                        </Link>
                    </td>
                </tr>
            );
        };

        return (
            <Layout>
                <div className="list-head">
                    <h1>Журналы</h1>
                    <div className="list-actions">
                        <Link route="magazines-create">
                            <a className="pt-button pt-intent-primary pt-icon-add">Создать</a>
                        </Link>
                    </div>
                </div>
                <table className="pt-table pt-interactive app-list">
                    <thead>
                    <tr>
                        <th className="app-list-id">ID</th>
                        <th className="app-list-title">Название</th>
                        <th className="app-list-actions"/>
                    </tr>
                    </thead>
                    <tbody>
                    { this.state.items.map(renderRow) }
                    </tbody>
                </table>
            </Layout>
        );
    };
}

export default withAuth(List);
