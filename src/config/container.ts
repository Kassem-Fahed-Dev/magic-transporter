/**
 * @module config/container
 * @description Dependency injection container setup using tsyringe.
 * Registers all repositories and services as singletons so they
 * are instantiated once and shared across the application.
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { MoverRepository } from "../repositories/mover.repository";
import { ItemRepository } from "../repositories/item.repository";
import { LogRepository } from "../repositories/log.repository";
import { MoverService } from "../services/mover.service";
import { ItemService } from "../services/item.service";

/** Register repository singletons (data access layer) */
container.registerSingleton<MoverRepository>(MoverRepository);
container.registerSingleton<ItemRepository>(ItemRepository);
container.registerSingleton<LogRepository>(LogRepository);

/** Register service singletons (business logic layer) */
container.registerSingleton<MoverService>(MoverService);
container.registerSingleton<ItemService>(ItemService);

export { container };
