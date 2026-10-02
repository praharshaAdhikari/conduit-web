import { NavLink, Outlet } from 'react-router';
import { adminPaths } from './admin.paths';

export function AdminLayout() {
  return (
    <div className="admin-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-12">
            <h1>Moderation</h1>
            <ul className="nav nav-pills outline-active">
              <li className="nav-item">
                <NavLink className="nav-link" to={adminPaths.usersPath}>
                  Users
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to={adminPaths.articlesPath}>
                  Articles
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to={adminPaths.logPath}>
                  Log
                </NavLink>
              </li>
            </ul>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
