import { Inject } from '@nestjs/common';
import { FILEZEN_STORAGE } from './filezen.constants';

/**
 * Inject the ZenStorage instance
 */
export const InjectZenStorage = () => Inject(FILEZEN_STORAGE); 