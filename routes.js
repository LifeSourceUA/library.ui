const nextRoutes = require('next-routes');
const routes = module.exports = nextRoutes();

routes.add('home', '/', 'index');
routes.add('login', '/login', 'Login');

routes.add('magazines-list', '/magazines', 'Magazines/List');
routes.add('magazines-create', '/magazines/create', 'Magazines/Single');
routes.add('magazines-single', '/magazines/:periodicalId', 'Magazines/Single');
routes.add('magazines-issues-list', '/magazines/:periodicalId/issues', 'Magazines/Issues/List');
routes.add('magazines-issues-create', '/magazines/:periodicalId/issues/create', 'Magazines/Issues/Single');
routes.add('magazines-issues-single', '/magazines/:periodicalId/issues/:issueId', 'Magazines/Issues/Single');

routes.add('newspapers-list', '/newspapers', 'Newspapers/List');
routes.add('newspapers-create', '/newspapers/create', 'Newspapers/Single');
routes.add('newspapers-single', '/newspapers/:periodicalId', 'Newspapers/Single');
routes.add('newspapers-issues-list', '/newspapers/:periodicalId/issues', 'Newspapers/Issues/List');
routes.add('newspapers-issues-create', '/newspapers/:periodicalId/issues/create', 'Newspapers/Issues/Single');
routes.add('newspapers-issues-single', '/newspapers/:periodicalId/issues/:issueId', 'Newspapers/Issues/Single');
