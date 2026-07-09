import { Contacts } from 'https://esm.sh/@capacitor-community/contacts@7.2.0';

export { Contacts };

export async function fetchNativeContacts() {
  var perm = await Contacts.checkPermissions();
  if (perm.contacts !== 'granted' && perm.contacts !== 'limited') {
    perm = await Contacts.requestPermissions();
  }
  if (perm.contacts !== 'granted' && perm.contacts !== 'limited') {
    throw new Error('Permesso rubrica negato. Abilitalo dalle Impostazioni del telefono.');
  }

  var result = await Contacts.getContacts({
    projection: { name: true, phones: true }
  });

  return result.contacts || [];
}
