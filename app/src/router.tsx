import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ListPage from './pages/ListPage';
import DetailPage from './pages/DetailPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <ListPage />,
      },
      {
        path: 'patients/:id',
        element: <DetailPage />,
      },
    ],
  },
]);

export default router;
