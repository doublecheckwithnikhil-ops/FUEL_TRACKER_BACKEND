"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function run() {
    const defaultPasswordHash = await bcryptjs_1.default.hash("V2@123", 10);
    await prisma.user.upsert({
        where: { empCode: "RTNR63" },
        update: { name: "Nikhil Vig", roleId: 3 },
        create: {
            name: "Nikhil Vig",
            empCode: "RTNR63",
            password: defaultPasswordHash,
            roleId: 3,
            employeeId: 9999
        },
    });
    console.log("Admin user created/updated");
}
run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seedAdmin.js.map