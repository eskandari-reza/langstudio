import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthController } from "./health.controller";
import { MeController } from "./me.controller";
import { PracticeController } from "./practice.controller";
import { langstudioController } from "./langstudio.controller";

@Module({
  imports: [],
  controllers: [AppController, HealthController, MeController, langstudioController, PracticeController],
  providers: [AppService],
})
export class AppModule {}
