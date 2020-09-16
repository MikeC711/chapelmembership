export class People {
    constructor(public lastName: string, public firstName: string, public familyKey: string,
        public memberStatus: string, public visibility: boolean, public eMail: string,
        public address: { streetAddr: string, city: string, state: string, zipCode: string},
        public contactPref: string, public birthDate: Date, public phone: string,
        public ministries: string [], public id ?: string) {}
}