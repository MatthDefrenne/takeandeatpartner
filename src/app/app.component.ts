import { Component } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AngularFireAuth, AngularFireDatabase]
})
export class AppComponent {

  user = null;
  isInitialized = false;
  orders: FirebaseListObservable<any>;
  totalOrders: any;

  constructor(public af: AngularFireAuth, public afD: AngularFireDatabase, public http: Http) {
    this.af.auth.onAuthStateChanged((user) => {
      this.isInitialized = true;
        if(user) {
          console.log('Logged user', user);
           this.user = user;
           this.getOrders(user.uid);
        } 
    }, (error) => {
    })


     
  }

  registerUser(email, password, restaurantName) {
    console.log(email)
    this.af.auth.createUserWithEmailAndPassword(email, password)
    .then((userCreated) => {
      this.registerRestaurant(this.af.auth.currentUser.uid, restaurantName);
      this.loginUser(email, password);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  loginUser(email, password) {
    console.log(email);
    this.af.auth.signInWithEmailAndPassword(email, password).catch((error) => {
      console.log(error);
    });
  }

  registerRestaurant(id, name) {
    const restaurants = this.afD.list('restaurants');
    restaurants.push({
      name: name,
      id: id
    });
  }



    getOrders(uid) {
      console.log(uid);
        this.orders  = this.afD.list('orders', {
            query: {
              orderByChild: 'uid',
              equalTo: uid,
          }
        })
        this.orders.subscribe((orders) => {
          this.totalOrders = orders.length;
        })
     }

  sendNotification(order) {
    console.log(order);
      let body = 
        {
          "notification": {
              "title": "Take and eat",
              "body": "Votre commande est terminée.",
              "sound": "default",
              "click_action": "FCM_PLUGIN_ACTIVITY",
              "icon": "fcm_push_icon"
          },
          "data": {
              "hello": "This is a Firebase Cloud Messagin  hbhj g Device Gr new v Message!",
          },
          "to": order.token
        };

        let headers: Headers = new Headers({
  'Content-Type': 'application/json',
  'Authorization': 'key=AIzaSyCJyON3iyMInolVK8K4rHSGopEEbLdEag8'
});
let options = new RequestOptions({ headers: headers });

      this.http
        .post('https://fcm.googleapis.com/fcm/send', body, options)
          .subscribe(data => {
                alert('ok');
          }, error => {
              console.log(error);
          });
  }

  

}
