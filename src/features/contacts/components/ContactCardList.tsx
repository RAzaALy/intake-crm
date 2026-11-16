import type { Contact } from "../schema";
import { ContactCard } from "./ContactCard";

type ContactCardListProps = {
  contacts: Contact[];
  now: Date;
};

export function ContactCardList({ contacts, now }: ContactCardListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {contacts.map((contact) => (
        <li key={contact.id}>
          <ContactCard contact={contact} now={now} />
        </li>
      ))}
    </ul>
  );
}
