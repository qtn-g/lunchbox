import { confirm, intro, log, outro } from '@clack/prompts';
import { showPreview, unwrap } from '@lunchbox-tools/utils';
import { askSetupPlan } from './prompt';
import { NEXT_STEPS } from './setup.constants';
import { buildSetupSteps, runSetupSteps } from './steps';

export const runSetup = async (): Promise<void> => {
  intro('Lunchbox setup');

  const plan = await askSetupPlan();
  const steps = buildSetupSteps(plan);
  if (steps.length === 0) {
    outro('Everything is already set up.');
    return;
  }

  showPreview(steps.map(({ label }) => label).join('\n'), 'Planned changes');
  const confirmed = unwrap(await confirm({ message: 'Do you want to apply these changes?' }));
  if (!confirmed) {
    outro('Setup canceled.');
    return;
  }

  const failures = runSetupSteps(steps);
  if (failures > 0) {
    process.exitCode = 1;
    outro(`Setup finished with ${failures} failed step(s).`);
    return;
  }
  if (plan.tools) {
    log.info(NEXT_STEPS);
  }
  outro('Setup complete!');
};
