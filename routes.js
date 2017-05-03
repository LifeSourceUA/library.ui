const nextRoutes = require('next-routes');
const routes = module.exports = nextRoutes();

routes.add('home', '/', 'index');
routes.add('login', '/login', 'Login');

routes.add('magazines-list', '/magazines', 'Magazines/List');
routes.add('magazines-create', '/magazines/create', 'Magazines/Single');
routes.add('magazines-single', '/magazines/:magazineId', 'Magazines/Single');
routes.add('magazines-issues-list', '/magazines/:magazineId/issues', 'Magazines/Issues/List');
routes.add('magazines-issues-create', '/magazines/:magazineId/issues/create', 'Magazines/Issues/Single');
routes.add('magazines-issues-single', '/magazines/:magazineId/issues/:issueId', 'Magazines/Issues/Single');
