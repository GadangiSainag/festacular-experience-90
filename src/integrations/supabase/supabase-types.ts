
import { Database } from "./types";

export type Tables = Database["public"]["Tables"];
export type Enums = Database["public"]["Enums"];

export type UsersTable = Tables["users"]["Row"];
export type EventsTable = Tables["events"]["Row"];
export type StarredEventsTable = Tables["starred_events"]["Row"];
export type FestivalUpdatesTable = Tables["festival_updates"]["Row"];
export type EventUpdatesTable = Tables["event_updates"]["Row"];

export type EventCategoryEnum = Enums["event_category"];
export type UserTypeEnum = Enums["user_type"];
