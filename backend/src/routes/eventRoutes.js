// EventRoutes.js

import express from "express";
import eventService from "../services/eventService.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const event = await eventService.deleteEvent(req.params.id);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

export default router;
