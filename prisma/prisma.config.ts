import { env } from "process";

export default {
    db: {
        url: env.DATABASE_URL,
    },
};
