import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClubAndUserTables202507010028461751297327275 implements MigrationInterface {
    name = 'CreateClubAndUserTables202507010028461751297327275'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clubs" ("id" SERIAL NOT NULL, "teacherId" integer NOT NULL, "name" character varying NOT NULL, "url" character varying, "preview" character varying, "description" text NOT NULL, "capacity" integer array NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, CONSTRAINT "PK_bb09bd0c8d5238aeaa8f86ee0d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e3d1c02d468c340b7eb48e54f9" ON "clubs" ("endDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_6fa634e6a1490bbaafe2f56f6a" ON "clubs" ("startDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_b72dba74c8574753d2aa824a69" ON "clubs" ("teacherId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5faeec2f663968ba35f61fe46d" ON "clubs" ("name") `);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'teacher', 'student')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL, "name" character varying NOT NULL, "grade" integer NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_6620cd026ee2b231beac7cfe57" ON "user" ("role") `);
        await queryRunner.query(`CREATE INDEX "IDX_f60629b2d23cd2e44df4fea98e" ON "user" ("grade") `);
        await queryRunner.query(`CREATE TABLE "clubs_applicants_user" ("clubsId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_190d8ed13829df6835c86abf14a" PRIMARY KEY ("clubsId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae76f73742e72090052cbff087" ON "clubs_applicants_user" ("clubsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ee119d627a170d5c24592a1c1e" ON "clubs_applicants_user" ("userId") `);
        await queryRunner.query(`CREATE TABLE "clubs_bookmarked_by_user" ("clubsId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_58dcea024152addc90cd378eb2a" PRIMARY KEY ("clubsId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_902ce9184f061591ab2821c465" ON "clubs_bookmarked_by_user" ("clubsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2b7861804604313af4eaf92e57" ON "clubs_bookmarked_by_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "clubs" ADD CONSTRAINT "FK_b72dba74c8574753d2aa824a695" FOREIGN KEY ("teacherId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clubs_applicants_user" ADD CONSTRAINT "FK_ae76f73742e72090052cbff087c" FOREIGN KEY ("clubsId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "clubs_applicants_user" ADD CONSTRAINT "FK_ee119d627a170d5c24592a1c1e3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clubs_bookmarked_by_user" ADD CONSTRAINT "FK_902ce9184f061591ab2821c4659" FOREIGN KEY ("clubsId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "clubs_bookmarked_by_user" ADD CONSTRAINT "FK_2b7861804604313af4eaf92e573" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clubs_bookmarked_by_user" DROP CONSTRAINT "FK_2b7861804604313af4eaf92e573"`);
        await queryRunner.query(`ALTER TABLE "clubs_bookmarked_by_user" DROP CONSTRAINT "FK_902ce9184f061591ab2821c4659"`);
        await queryRunner.query(`ALTER TABLE "clubs_applicants_user" DROP CONSTRAINT "FK_ee119d627a170d5c24592a1c1e3"`);
        await queryRunner.query(`ALTER TABLE "clubs_applicants_user" DROP CONSTRAINT "FK_ae76f73742e72090052cbff087c"`);
        await queryRunner.query(`ALTER TABLE "clubs" DROP CONSTRAINT "FK_b72dba74c8574753d2aa824a695"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2b7861804604313af4eaf92e57"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_902ce9184f061591ab2821c465"`);
        await queryRunner.query(`DROP TABLE "clubs_bookmarked_by_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ee119d627a170d5c24592a1c1e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae76f73742e72090052cbff087"`);
        await queryRunner.query(`DROP TABLE "clubs_applicants_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f60629b2d23cd2e44df4fea98e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6620cd026ee2b231beac7cfe57"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5faeec2f663968ba35f61fe46d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b72dba74c8574753d2aa824a69"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6fa634e6a1490bbaafe2f56f6a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3d1c02d468c340b7eb48e54f9"`);
        await queryRunner.query(`DROP TABLE "clubs"`);
    }

}
