import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaunchDarklyConfig } from './launch-darkly-config';
import { LaunchDarklyService } from './launch-darkly.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [],
})
export class LaunchDarklyModule<T> {
  constructor(
    @Optional() @SkipSelf() parentModule: LaunchDarklyModule<T>,
    launchDarklyService: LaunchDarklyService<T>,
  ) {
    if (!parentModule) {
        // launchDarklyService.init();
    }
  }

  static forRoot(config: LaunchDarklyConfig): ModuleWithProviders {
    return {
      ngModule: LaunchDarklyModule,
      providers: [
        { provide: LaunchDarklyConfig, useValue: config },
        LaunchDarklyService
      ]
    };
  }
 }
