import { Injectable } from '@angular/core';
import { initialize, LDClient, LDFlagSet, LDUser } from 'ldclient-js';
import { Observable, from, fromEventPattern } from 'rxjs';
import { mapTo, shareReplay, map, switchMap, startWith } from 'rxjs/operators';
import { LaunchDarklyConfig } from './launch-darkly-config';

@Injectable({
  providedIn: 'root'
})
/**
 * Launch Darkly wrapper for Angular. Generic type is used to allow Typescript to strongly type methods with
 * your specific feature flags. e.g. LaunchDarklyService<{ myFlag: boolean, myStringFlag: 'possible' | 'value' }>
 *
 * Of course, you'll want to store your flags as a central type/interface. This will allow type safety across your
 * project and IDE features.
 */
export class LaunchDarklyService<TFeatures extends LDFlagSet> {

  /** Launch Darkly requires the use of this object to denote an anonymous user */
  private static readonly ANONYMOUS = {anonymous: true};

  /** Instance of the LaunchDarkly client, emitting only after LaunchDarkly is initialised */
  private client$: Observable<LDClient>;

  constructor(
    private launchDarklyConfig: LaunchDarklyConfig,
  ) {

    // start launchdarkly with config from the module
    const client = initialize(this.launchDarklyConfig.clientId, LaunchDarklyService.ANONYMOUS, this.launchDarklyConfig.options);

    // create an observable which points to the LD instance only after it reports as initialised
    this.client$ = from(client.waitForInitialization()).pipe(
      mapTo(client),
      shareReplay(1),
    );

  }

  /**
   * Tell Launch Darkly who is using the site so they can be delivered the correct features
   * @param user The user to connect Launch Darkly to (see LDUser in their client: 'ldclient-js')
   */
  identify(user: LDUser): Observable<LDFlagSet> {
    return this.client$.pipe(
      switchMap(client => client.identify(user))
    );
  }

  /**
   * Announce to Launch Darkly that the user has logged out, or is to be treated as anonymous
   */
  deidentify(): Observable<LDFlagSet> {
    return this.client$.pipe(
      switchMap(client => client.identify(LaunchDarklyService.ANONYMOUS)),
    );
  }

  /**
   * Get the instantaneous value of a flag. Consider that it won't reply until the LaunchDarkly client has initiated.
   * @param key The flag key
   * @param defaultValue A default value to use if there is a problem in the launchdarkly client
   * @returns An observable which returns the value of the variation at the earliest possible moment
   */
  variation<TK extends keyof TFeatures>(key: TK, defaultValue?: TFeatures[TK]): Observable<TFeatures[TK]> {
    return this.client$.pipe(
      map(client => client.variation(key as string, defaultValue)),
    );
  }

  /**
   * Get a stream of values for a flag; will keep emitting with changes as long as subscribed. Will
   * not reply until the LaunchDarkly client has initiated.
   * @param key The flag key
   * @param defaultValue A default balue to use if there is a problem in the LaunchDarkly client
   * @returns An observable which emits a value whenever a change is detected with the flag in realtime
   */
  variationStream<TK extends keyof TFeatures>(key: TK, defaultValue?: TFeatures[TK]): Observable<TFeatures[TK]> {

    return this.client$.pipe(
      switchMap(client => fromEventPattern<TFeatures[TK]>(
        handler => client.on(`change:${key}`, result => handler(result)),
        handler => client.off(`change:${key}`, result => handler(result)),
      ).pipe(
        startWith<TFeatures[TK]>(client.variation(key as string, defaultValue)),
      )),
    );
  }
}
