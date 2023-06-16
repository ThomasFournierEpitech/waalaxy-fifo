import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validateSync } from 'class-validator';
import { FifoDashboardElement } from '../../shared/fifo.type';
import { FifoDashboardElementsDto, FifoQueueDto } from '../dtos/fifo.dto';

@Injectable()
export class FifoValidationService {
  private readonly logger: Logger = new Logger('FifoValidationService');

  extractValidationErrors(
    errors: ValidationError[],
    parentPath = '',
  ): string[] {
    const errorMessages: string[] = [];

    errors.forEach((error) => {
      const propertyPath = `${parentPath}${error.property}`;
      const { constraints, children } = error;

      if (constraints) {
        Object.values(error.constraints).forEach((message: string) => {
          errorMessages.push(`${propertyPath}: ${message}`);
        });
      }

      if (children && children.length > 0) {
        const childErrorMessages = this.extractValidationErrors(
          error.children,
          `${propertyPath}.`,
        );
        errorMessages.push(...childErrorMessages);
      }
    });

    return errorMessages;
  }

  validateInitialeFifoValues(
    actionsInit: FifoDashboardElement[],
    fifoQueueInit: string[],
  ) {
    const combinedErrors = validateSync(
      plainToInstance(FifoQueueDto, {
        fifoElements: fifoQueueInit,
      }),
    ).concat(
      validateSync(
        plainToInstance(FifoDashboardElementsDto, {
          dashboardActions: actionsInit,
        }),
      ),
    );
    if (combinedErrors.length > 0) {
      const validationErrors = this.extractValidationErrors(combinedErrors);
      throw new Error(JSON.stringify(validationErrors));
    }

    return true;
  }
}
