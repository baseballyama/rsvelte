import { Context } from 'runed';

type TimelineContextValue = {
	activeStep: number;
	setActiveStep: (step: number) => void;
};

export const timelineContext = new Context<TimelineContextValue | undefined>('timeline:context');

export const useTimeline = () => {
	const context = timelineContext.get();

	if (!context) {
		throw new Error('useTimeline must be used within a Timeline');
	}

	return context;
};
