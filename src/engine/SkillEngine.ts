import { Assets, Sprite } from "pixi.js";
import gsap from "gsap";
import { Hero } from "../ui/Hero";
import { Monster } from "../ui/Monster";
import skillsData from "../data/skills.json";

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  animationAsset: string;
  actionType: "melee" | "ranged";
  targetType: "single" | "multiple";
  effects: {
    damage: {
      formula: string;
      modifier: number;
    };
  };
  sequence: SkillSequenceStep[];
}

export interface SkillSequenceStep {
  type: string;
  duration: number;
  ease?: string;
  offset?: number;
}

export interface SkillExecutionContext {
  caster: Hero | Monster;
  targets: (Hero | Monster)[];
  direction: "up" | "down";
  skill: SkillDefinition;
}

export class SkillEngine {
  private static instance: SkillEngine;
  private skills: Map<string, SkillDefinition> = new Map();

  private constructor() {
    this.loadSkills();
  }

  public static getInstance(): SkillEngine {
    if (!SkillEngine.instance) {
      SkillEngine.instance = new SkillEngine();
    }
    return SkillEngine.instance;
  }

  private loadSkills(): void {
    Object.entries(skillsData.skills).forEach(([key, skillData]) => {
      this.skills.set(key, skillData as SkillDefinition);
    });
  }

  public getSkill(skillId: string): SkillDefinition | undefined {
    return this.skills.get(skillId);
  }

  public getAllSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  public async executeSkill(context: SkillExecutionContext): Promise<void> {
    const { caster, targets, direction, skill } = context;

    for (const step of skill.sequence) {
      await this.executeSequenceStep(step, caster, targets, direction, skill);
    }
  }

  private async executeSequenceStep(
    step: SkillSequenceStep,
    caster: Hero | Monster,
    targets: (Hero | Monster)[],
    direction: "up" | "down",
    skill: SkillDefinition,
  ): Promise<void> {
    return new Promise((resolve) => {
      switch (step.type) {
        case "move_to_target":
          this.executeMove(caster, targets, step, resolve);
          break;
        case "execute_animation":
          this.executeAnimation(
            caster,
            targets,
            direction,
            skill,
            step,
            resolve,
          );
          break;
        case "position_for_ranged":
          this.executeRangedPosition(caster, direction, step, resolve);
          break;
        case "execute_ranged_animation":
          this.executeRangedAnimation(
            caster,
            targets,
            direction,
            skill,
            step,
            resolve,
          );
          break;
        case "return_to_position":
          this.executeReturn(caster, step, resolve);
          break;
        default:
          resolve();
      }
    });
  }

  private executeMove(
    caster: Hero | Monster,
    targets: (Hero | Monster)[],
    step: SkillSequenceStep,
    resolve: () => void,
  ): void {
    const originalX = caster.x;
    const originalY = caster.y;
    (
      caster as unknown as { _originalX: number; _originalY: number }
    )._originalX = originalX;
    (
      caster as unknown as { _originalX: number; _originalY: number }
    )._originalY = originalY;

    gsap.to(caster, {
      x: targets[0].x,
      y: targets[0].y,
      duration: step.duration,
      ease: step.ease || "power1.out",
      onComplete: resolve,
    });
  }

  private executeAnimation(
    caster: Hero | Monster,
    targets: (Hero | Monster)[],
    direction: "up" | "down",
    skill: SkillDefinition,
    step: SkillSequenceStep,
    resolve: () => void,
  ): void {
    targets.forEach((target) => {
      const animation = this.createAnimation(
        skill.animationAsset,
        target.x,
        target.y,
        direction,
      );
      caster.parent.addChild(animation);

      gsap.to(animation, {
        ease: "linear",
        duration: step.duration,
        onComplete: () => {
          caster.parent.removeChild(animation);
        },
      });
    });

    setTimeout(resolve, step.duration * 1000);
  }

  private executeRangedPosition(
    caster: Hero | Monster,
    direction: "up" | "down",
    step: SkillSequenceStep,
    resolve: () => void,
  ): void {
    const originalX = caster.x;
    const originalY = caster.y;
    (
      caster as unknown as { _originalX: number; _originalY: number }
    )._originalX = originalX;
    (
      caster as unknown as { _originalX: number; _originalY: number }
    )._originalY = originalY;

    const offset = step.offset || -20;
    const yOffset = direction === "up" ? offset : -offset;

    gsap.to(caster, {
      y: originalY + yOffset,
      duration: step.duration,
      ease: step.ease || "power1.out",
      onComplete: resolve,
    });
  }

  private executeRangedAnimation(
    caster: Hero | Monster,
    targets: (Hero | Monster)[],
    direction: "up" | "down",
    skill: SkillDefinition,
    step: SkillSequenceStep,
    resolve: () => void,
  ): void {
    const originalX = caster.x;
    const originalY = caster.y;

    targets.forEach((target) => {
      const animation = this.createAnimation(
        skill.animationAsset,
        originalX,
        originalY,
        direction,
      );
      caster.parent.addChild(animation);

      gsap.fromTo(
        animation,
        {
          alpha: 0.1,
          x: originalX,
          y: originalY,
        },
        {
          alpha: 1,
          x: target.x,
          y: target.y,
          ease: "linear",
          duration: step.duration,
          onComplete: () => {
            caster.parent.removeChild(animation);
          },
        },
      );
    });

    setTimeout(resolve, step.duration * 1000);
  }

  private executeReturn(
    caster: Hero | Monster,
    step: SkillSequenceStep,
    resolve: () => void,
  ): void {
    const originalX =
      (caster as unknown as { _originalX: number; _originalY: number })
        ._originalX || caster.x;
    const originalY =
      (caster as unknown as { _originalX: number; _originalY: number })
        ._originalY || caster.y;

    gsap.to(caster, {
      x: originalX,
      y: originalY,
      duration: step.duration,
      ease: step.ease || "power1.out",
      onComplete: resolve,
    });
  }

  private createAnimation(
    assetName: string,
    x: number,
    y: number,
    direction: "up" | "down",
  ): Sprite {
    const sprite = new Sprite(Assets.get(assetName));
    sprite.anchor.set(0.5);
    sprite.scale.set(1);
    sprite.x = x;
    sprite.y = y;

    if (direction === "down") {
      sprite.scale.x = -1;
      sprite.scale.y = -1;
    }

    return sprite;
  }
}
