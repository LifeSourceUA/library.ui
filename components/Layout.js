import React from 'react';
import Head from 'next/head';

import { Link } from '../routes';
import Theme from '../theme/main.css';

export default ({ children, title = 'This is the default title' }) => (
    <div className="app-wrap">
        <Head>
            <title>{ title }</title>
            <meta charSet='utf-8' />
            <meta name='viewport' content='initial-scale=1.0, width=device-width' />
            <base href="/"/>
            <style dangerouslySetInnerHTML={{__html: Theme}} />
        </Head>
        <div className="app">
            <section className="app-head">
                <nav className="pt-navbar .modifier">
                    <div className="pt-navbar-group pt-align-left">
                        <div className="pt-navbar-heading">Life Source Library</div>
                        <div className="pt-navbar-divider"/>
                        <Link route="magazines-list">
                            <a className="pt-button pt-minimal">Журналы</a>
                        </Link>
                    </div>
                </nav>
            </section>
            <section className="app-content">
                { children }
            </section>
        </div>
    </div>
);
