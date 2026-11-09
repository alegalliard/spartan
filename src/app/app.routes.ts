import { Routes } from '@angular/router';
import { EventsList } from './pages/events/list/list';
import { NotFound } from './pages/not-found/not-found';
import { RegistrationsList } from './pages/registrations/list/list';
import { EventDetails } from './pages/events/event-details/event-details';

export const routes: Routes = [
  {
    path: 'events',
    component: EventsList,
  },
  {
    path: 'registrations',
    component: RegistrationsList,
  },
  {
    path: 'events/:id',
    component: EventDetails,
  },
  {
    path: '**',
    component: NotFound,
  },
];
