import { z } from "zod";

export const ZDuty = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(255)
});

export const ZCreateDutyDTO = ZDuty.omit({ id: true });

export const ZUpdateDutyDTO = ZDuty.omit({ id: true });

export const ZDutyParams = z.object({
	id: z.string().uuid()
});

export type Duty = z.infer<typeof ZDuty>;
export type CreateDutyDTO = z.infer<typeof ZCreateDutyDTO>;
export type UpdateDutyDTO = z.infer<typeof ZUpdateDutyDTO>;
