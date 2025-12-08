// App.js
import React, { useState } from "react";
import { StatusBar, SafeAreaView, StyleSheet } from "react-native";
import Login from "./screens/Login";
import ForgotPassword from "./screens/ForgotPassword";
import IntakeStep1 from "./screens/IntakeStep1";
import IntakeStep2 from "./screens/IntakeStep2";
import IntakeStep3 from "./screens/IntakeStep3";
import MyOrders from "./screens/MyOrders";
import EditOrder from "./screens/EditOrder";
import { colors } from "./styles/tokens";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [intakeDraft, setIntakeDraft] = useState(null);

  // store all bookings
  const [orders, setOrders] = useState([]);

  // which order we’re editing on the EditOrder page
  const [editingOrder, setEditingOrder] = useState(null);

  const upsertOrder = (payload) => {
    const id = payload.id || String(Date.now());
    const enriched = {
      ...payload,
      id,
      createdAt: payload.createdAt || new Date().toISOString(),
    };

    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === id);
      if (idx === -1) {
        return [enriched, ...prev]; // new at top
      }
      const copy = [...prev];
      copy[idx] = enriched; // update existing
      return copy;
    });
  };

  const deleteOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle="dark-content" />

      {screen === "login" && (
        <Login
          onSignIn={() => setScreen("intake1")}
          onNavigate={(route) => setScreen(route)} // "forgot"
        />
      )}

      {screen === "forgot" && (
        <ForgotPassword
          onBack={() => setScreen("login")}
          onDone={() => setScreen("login")}
        />
      )}

      {screen === "intake1" && (
        <IntakeStep1
          onNext={(data) => {
            setIntakeDraft(data);
            setScreen("intake2");
          }}
          onCancel={() => setScreen("login")}
          onViewOrders={() => setScreen("orders")}   // NEW button hook
        />
      )}

      {screen === "intake2" && (
        <IntakeStep2
          draft={intakeDraft}
          onBack={() => setScreen("intake1")}
          onNext={(dataFromStep2) => {
            setIntakeDraft(dataFromStep2);
            setScreen("confirm");
          }}
        />
      )}

      {screen === "confirm" && (
        <IntakeStep3
          draft={intakeDraft}
          onBack={() => setScreen("intake2")}
          onFinish={(finalPayload) => {
            // create new booking and go to My Orders
            upsertOrder(finalPayload);
            setIntakeDraft(null);
            setScreen("orders");
          }}
        />
      )}

      {screen === "orders" && (
        <MyOrders
          orders={orders}
          onBack={() => setScreen("login")}           // Sign out
          onNew={() => {
            setIntakeDraft(null);
            setScreen("intake1");
          }}
          onEdit={(order) => {
            setEditingOrder(order);
            setScreen("editOrder");                  // go to edit page instead of Step 2
          }}
        />
      )}

      {screen === "editOrder" && editingOrder && (
        <EditOrder
          order={editingOrder}
          onBack={() => {
            setEditingOrder(null);
            setScreen("orders");
          }}
          onSave={(updated) => {
            upsertOrder(updated);
            setEditingOrder(null);
            setScreen("orders");
          }}
          onCancelOrder={(id) => {
            deleteOrder(id);
            setEditingOrder(null);
            setScreen("orders");
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.bg },
});
