<script>
import { SIDEBAR_MENU } from "./sidebar-menu";

export default {
  data() {
    return {
      isDrawerExpanded: true,
      openedMenu: null,
    };
  },
  methods: {
    onClickMenu(menu) {
      if (!Array.isArray(menu.children)) return;

      if (this.openedMenu === menu.name) {
        this.openedMenu = null;
      } else {
        this.openedMenu = menu.name;
      }
    },
    isMenuOpen(menu) {
      return this.openedMenu === menu.name;
    },
    hasActiveSubmenu(menu) {
      if (!Array.isArray(menu.children)) return false;
      return menu.children.some((item) => item.path === this.$route.path);
    },
  },

  computed: {
    // NOTE: We can't set src directly in template ~/assets/brand/${img}
    // so we need to use require()
    logoUrl() {
      const appName = this.$config.appName;

      if (this.isDrawerExpanded) {
        return require(`~/assets/brand/${appName}.png`);
      }
      return require(`~/assets/brand/${appName}-logo.png`);
    },
    sidebarMenu() {
      const flaggingAddsOn = SIDEBAR_MENU.map((item) => {
        if (this.admin) {
          return item;
        } else {
          if (item.path == "/adds-on" && !this.isAdmin) {
            return {
              ...item,
              children: item.children.slice(0, 1),
            };
          }
          return item;
        }
      });
      return flaggingAddsOn.map((menu) => {
        if (menu.path === "/tutorial") {
          return {
            ...menu,
            name: `${this.$config.appName} tutorial`,
          };
        }
        return menu;
      });
    },
    userInfo() {
      return this.$store.getters["user/getUserInfo"];
    },
    isAdmin() {
      return this.userInfo.role == "admin";
    },
  },

  watch: {
    isDrawerExpanded(val) {
      this.$emit("expanded", val);
    },
  },

  mounted() {
    const activeMenu = this.sidebarMenu.find((menu) =>
      this.hasActiveSubmenu(menu)
    );
    if (activeMenu) {
      this.openedMenu = activeMenu.name;
    }
  },
};
</script>

<template>
  <aside
    class="fixed top-0 bottom-0 w-[300px] bg-white transition-all overflow-y-auto overflow-x-hidden shadow-sidebar z-20"
    :class="{ '!w-[104px]': !isDrawerExpanded }"
  >
    <div
      class="flex items-center justify-between gap-2 px-5 py-6 sticky top-0 bg-white"
      :class="{ 'gap-2 ml-5': !isDrawerExpanded }"
    >
      <img
        :src="logoUrl"
        alt="logo"
        class="w-[120px] h-auto"
        :class="{ 'w-[30px] h-[30px]': !isDrawerExpanded }"
      />

      <button
        @click="isDrawerExpanded = !isDrawerExpanded"
        class="text-primary"
      >
        <Icon
          :name="isDrawerExpanded ? 'menu-collapse' : 'menu-expand'"
          :size="28"
        />
      </button>
    </div>

    <div class="mt-2 px-5 py-3">
      <div
        v-for="(menu, idx) in sidebarMenu"
        :key="idx"
        class="cursor-pointer w-full"
      >
        <template
          v-if="
            typeof menu.isShown === 'function' ? menu.isShown($config) : true
          "
        >
          <template v-if="menu.name !== 'divider'">
            <component
              :is="Array.isArray(menu.children) ? 'button' : 'NuxtLink'"
              :to="menu.path || ''"
              class="menu-item flex items-center rounded-lg w-full"
              :class="[
                isDrawerExpanded
                  ? 'p-3 justify-between'
                  : 'px-2 py-3 justify-center',
                { 'menu-item--active': hasActiveSubmenu(menu) },
              ]"
              @click="onClickMenu(menu)"
            >
              <div class="flex items-center space-x-2">
                <Icon
                  class="icon"
                  :name="menu.icon"
                  :size="menu.iconSize || 20"
                />
                <span v-if="isDrawerExpanded" class="menu-item__text">
                  {{ menu.name }}
                </span>
              </div>

              <button
                v-if="menu.children && isDrawerExpanded"
                class="icon transition-all"
                :class="{ 'rotate-180': isMenuOpen(menu) }"
              >
                <Icon name="chv-down" :size="16" />
              </button>
            </component>

            <div
              v-if="menu.children && (!isDrawerExpanded || isMenuOpen(menu))"
            >
              <NuxtLink
                v-for="(submenu, submenuIdx) in menu.children"
                :key="submenuIdx"
                :to="submenu.path"
                class="submenu-item flex items-center space-x-2 rounded-lg"
                :class="{
                  'ml-5 p-3': isDrawerExpanded,
                  'px-2 py-3 justify-center': !isDrawerExpanded,
                }"
              >
                <Icon
                  class="icon"
                  :name="submenu.icon"
                  :size="submenu.iconSize || 20"
                />
                <span v-if="isDrawerExpanded" class="submenu-item__text">
                  {{ submenu.name }}
                </span>
              </NuxtLink>
            </div>
          </template>

          <hr v-else class="mt-6 mb-3 border-gray-200" />
        </template>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="postcss">
.menu-item {
  @apply transition-all;

  &:hover {
    @apply bg-secondary bg-opacity-[4%];
  }

  &__text {
    @apply text-dark text-base font-normal transition-all capitalize;
  }
}

.submenu-item {
  @apply transition-all;

  &:hover {
    @apply bg-secondary bg-opacity-[4%];
  }

  .icon {
    @apply text-dark3;
  }

  &__text {
    @apply text-dark3 text-base font-normal transition-all;
  }
}

.nuxt-link-active,
.menu-item--active {
  &.menu-item {
    @apply bg-secondary bg-opacity-10;
  }

  .icon {
    @apply text-secondary;
  }

  .menu-item__text,
  .submenu-item__text {
    @apply text-secondary font-bold;
  }
}
</style>
