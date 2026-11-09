import { RegistrationI } from '../registrations/registration.model';

export interface EventI {
  id: number;
  name: string;
  date: string;
  bands: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaginatedResponseI<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface EventWithRegistrationCountI extends EventI {
  registrationCount: number;
}

export interface EventDetailsI {
  event: EventI;
  registrations: RegistrationI[];
}
