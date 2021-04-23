import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

function randomString(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < 8; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

@Component({
  selector: 'app-redirect',
  template: 'Click <a href="{{redirectUrl}}">here</a> to be redirected.',
})
export class RedirectComponent implements OnInit {

  private router: Router;
  redirectUrl: string;

  constructor(router: Router) {
    this.router = router;
    this.redirectUrl = '/puzzle/' + randomString();
  }

  ngOnInit(): void {
    this.router.navigateByUrl('/puzzle/' + randomString(), {
      replaceUrl: true
    });
  }

}
